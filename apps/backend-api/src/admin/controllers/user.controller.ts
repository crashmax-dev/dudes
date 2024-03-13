import { Auth } from '@app/backend-api/auth/decorators';
import { AuthGuard } from '@app/backend-api/auth/guards';
import { AuthUserProps } from '@app/backend-api/auth/services/auth.service';
import { ConfigService } from '@app/backend-api/config/config.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserEntity } from '@lib/types';

@Controller('/user')
export class UserController {
  public constructor(private readonly configService: ConfigService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  public getUser(@Auth() user: AuthUserProps): UserEntity {
    return {
      ...user,
      previewUrl: `${this.configService.clientUrl}/${user.guid}`,
    };
  }
}
