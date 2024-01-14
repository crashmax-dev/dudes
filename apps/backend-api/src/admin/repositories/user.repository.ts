import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/backend-api/database/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async getUserByGuid(guid: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        guid,
      },
    });
  }

  public async getUserById(userId: number): Promise<User> {
    return this.prismaService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  public async update(
    userId: number,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return this.prismaService.user.update({
      data,
      where: {
        id: userId,
      },
    });
  }
}
