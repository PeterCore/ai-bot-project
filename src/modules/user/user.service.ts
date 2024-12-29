import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // 创建用户
  async createUser(data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({ data });
    await this.syncUserToRedis(user);
    return user;
  }

  /**
   * 验证用户凭证（根据实际业务实现）
   */
  async validateUser(phone: string, code: string): Promise<User | null> {
    // 这里应有验证码的验证逻辑，例如从 Redis 中获取验证码并比对
    // 示例中假设验证码始终有效
    return this.prisma.user.findUnique({ where: { phone } });
  }

  //get User info from current token
  async getUserByCurrentToken(token: string): Promise<User> {
    const userId = await this.redisService.get(`userId:${token}`);
    if (!userId) {
      return null;
    }
    const user = await this.getUserById(userId);
    return user;
  }

  // 根据id获取用户
  async getUserById(userId: string): Promise<User> {
    const cacheKey = `user:${userId}`;
    const userCache = await this.redisService.get(cacheKey);
    if (userCache) return userCache;

    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (user) {
      // 同步到Redis
      await this.syncUserToRedis(user);
    }
    return user;
  }

  // 根据phone获取
  async getUserByPhone(phone: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  // 根据email获取
  async getUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // 更新用户信息
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { userId },
      data,
    });
    await this.syncUserToRedis(user);
    return user;
  }

  // 同步到Redis
  async syncUserToRedis(user: User) {
    const cacheKey = `user:${user.userId}`;
    await this.redisService.set(cacheKey, user, 3600); // 假设缓存1小时
  }
}
