import { Reward, Command } from '@prisma/client';

export type UserEntity = {
  name: string;
  picture: string;
  twitchId: string;
  userId: number;
  guid: string;
  personalUrl: string;
};

export type CommandEntity = Command;

export type RewardEntity = Reward;
