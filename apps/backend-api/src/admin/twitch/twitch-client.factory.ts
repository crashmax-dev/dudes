import { ConfigService } from '@app/backend-api/config/config.service';
import { TWITCH_PLATFORM_ID, TWITCH_SCOPE } from '@app/backend-api/constants';
import { PrismaService } from '@app/backend-api/database/prisma.service';
import {
  MessageEntity, RaidData,
  RewardRedemptionData, TwitchChatterEntity
} from '@lib/types';
import { HttpException, Logger } from '@nestjs/common';
import { UserToken } from '@prisma/client';
import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { HttpStatusCode } from 'axios';
import { EventClient } from '../event-client/event-client.factory';
import { ChatMessageService } from '../services';
import { TokenRevokedException } from './token-revoked.exception';
import { TwitchUserFilterService } from './twitch-user-filter.service';

const TWITCH_CHATTERS_SEND_INTERVAL = 60 * 1000; // 1 minute.

export class TwitchClientFactory {
  private readonly logger = new Logger(TwitchClientFactory.name);

  public authProvider: RefreshingAuthProvider;
  public apiClient: ApiClient;

  public constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly twitchUserFilterService: TwitchUserFilterService,
    private readonly chasMessageService: ChatMessageService
  ) {
    this.authProvider = new RefreshingAuthProvider({
      clientId: this.configService.twitchClientId,
      clientSecret: this.configService.twitchClientSecret,
    });

    this.authProvider.onRefresh(async (userId, newTokenData) => {
      if (newTokenData.refreshToken) {
        await this.prisma.userToken.update({
          where: {
            platformUserId_platformId: {
              platformUserId: userId,
              platformId: TWITCH_PLATFORM_ID,
            },
          },
          data: {
            refreshToken: newTokenData.refreshToken,
            accessToken: newTokenData.accessToken,
            expiresIn: newTokenData.expiresIn ?? undefined,
            obtainmentTimestamp: new Date(newTokenData.obtainmentTimestamp),
          },
        });
      }
    });

    this.authProvider.onRefreshFailure((userId) => {
      this.logger.log('Failed to refresh token.', { userId });
    });

    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  public async addUserToken(
    userId: number,
    intents: string[] = []
  ): Promise<UserToken> {
    const userToken = await this.prisma.userToken.findUnique({
      where: {
        userId_platformId: {
          userId: userId,
          platformId: TWITCH_PLATFORM_ID,
        },
      },
    });

    if (!userToken) {
      // TODO: check prod error
      throw new HttpException(
        `User token with user id (${userId}) hasn't been found.`,
        HttpStatusCode.InternalServerError
      );
    }

    const obtainmentTimestamp = userToken.obtainmentTimestamp?.getTime();

    this.authProvider.addUser(
      userToken.platformUserId,
      {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        expiresIn: userToken.expiresIn,
        obtainmentTimestamp: obtainmentTimestamp ?? 0,
        scope: TWITCH_SCOPE,
      },
      intents
    );

    return userToken;
  }

  public async createApiClient(userId: number): Promise<ApiClient> {
    await this.addUserToken(userId);
    return this.apiClient;
  }

  public createEventClient(userToken: UserToken): EventClient {
    const chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [userToken.platformLogin],
    });

    const eventSubWsListener = new EventSubWsListener({
      apiClient: this.apiClient,
    });

    eventSubWsListener.start();

    const onRewardRedemptionAdd = (
      listener: (data: RewardRedemptionData) => void
    ): void => {
      eventSubWsListener.onChannelRedemptionAdd(
        userToken.platformUserId,
        (data) => {
          listener({
            rewardId: data.rewardId,
            userId: data.userId,
            userDisplayName: data.userDisplayName,
            input: data.input,
          });
        }
      );
    };

    const onRaid = (listener: (data: RaidData) => void): void => {
      eventSubWsListener.onChannelRaidTo(userToken.platformUserId, async (data) => {
        const broadcaster = await data.getRaidingBroadcaster();
        const apiClient = await this.createApiClient(userToken.userId);
        const color = await apiClient.chat.getColorForUser(broadcaster.id);

        listener({
          broadcaster: {
            id: broadcaster.id,
            info: {
              displayName: broadcaster.displayName,
              color: color ?? undefined
            }
          },
          viewers: data.viewers,
        });
      });
    };

    const onChatMessage = (listener: (data: MessageEntity) => void): void => {
      chatClient.onMessage((channel, user, text, msg) => {
        if (this.twitchUserFilterService.isBot(msg.userInfo.userName)) {
          return;
        }

        const name = msg.userInfo.displayName;
        const userId = msg.userInfo.userId;

        const emotes = msg.emoteOffsets;

        const emoteNames = Array.from(emotes.entries()).map((entry) => {
          const range = entry[1][0].split('-');
          const start = Number(range[0]);
          const end = Number(range[1]) + 1;

          return text.substring(start, end);
        });

        const emoteIds = Array.from(emotes.entries()).map((entry) => entry[0]);

        listener({
          userId: userId,
          emotes: emoteIds.map((emote) => this.getTwitchEmoteUrl(emote)),
          message: this.chasMessageService.stripEmotes(text, emoteNames),
          info: {
            displayName: name,
            color: msg.userInfo.color,
          },
        });
      });
    };

    let timerId: NodeJS.Timer;

    const onChatters = (listener: (data: TwitchChatterEntity[]) => void): void => {
      timerId = setInterval(async () => {
        try {
          const apiClient = await this.createApiClient(userToken.userId);

          apiClient.asUser(userToken.platformUserId, async (ctx) => {
            const chatters = await ctx.chat.getChatters(
              userToken.platformUserId
            );

            const users = chatters.data
              .filter(
                (chatter) =>
                  !this.twitchUserFilterService.isBot(chatter.userName)
              )
              .map((chatter) => ({
                userId: chatter.userId,
                name: chatter.userDisplayName,
              }));

            listener(users);
          });
        } catch (error) {
          if (error instanceof TokenRevokedException) {
            // Token is revoked, do nothing.
            return;
          }

          this.logger.error('Failed to send chatters.', {
            error: (error as Error).message,
          });
        }
      }, TWITCH_CHATTERS_SEND_INTERVAL);
    };

    return {
      connect: async (): Promise<void> => {
        chatClient.connect();

        this.logger.log('TwitchClientFactory client has been connected');
      },
      disconnect: async (): Promise<void> => {
        clearInterval(timerId);
        chatClient.quit();
        eventSubWsListener.stop();

        this.logger.log('TwitchClientFactory client has been disconnected');
      },
      onChatMessage,
      onChatters,
      onRaid,
      onRewardRedemptionAdd,
    };
  }

  private getTwitchEmoteUrl(emote: string): string {
    return `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/static/light/3.0`;
  }
}
