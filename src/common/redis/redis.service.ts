import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '@prisma/client';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password =
      this.configService.get<string>('REDIS_PASSWORD') || undefined;

    this.redisClient = new Redis({
      host,
      port,
      password,
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: any, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      await this.redisClient.set(
        key,
        JSON.stringify(value),
        'EX',
        expireSeconds,
      );
    } else {
      await this.redisClient.set(key, JSON.stringify(value));
    }
  }

  async get(key: string): Promise<any> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async lpush(key: string, value: any) {
    await this.redisClient.lpush(key, value);
  }

  async ltrim(key: string, start: number | string, end: number | string) {
    await this.redisClient.ltrim(key, start, end); // 保持最新 10 条
  }
  async lrange(key: string, start: number | string, stop: number | string) {
    return this.redisClient.lrange(key, start, stop);
  }
  /**
   * 存储 Refresh Token
   */
  async setRefreshToken(
    refreshToken: string,
    userId: string,
    expireSeconds: number = 7 * 24 * 60 * 60,
  ) {
    await this.redisClient.set(
      `refresh_token:${refreshToken}`,
      userId,
      'EX',
      expireSeconds,
    );
  }

  /**
   * 获取 Refresh Token
   */
  async getRefreshToken(refreshToken: string): Promise<string | null> {
    return await this.redisClient.get(`refresh_token:${refreshToken}`);
  }

  /**
   * 删除 Refresh Token
   */
  async delRefreshToken(refreshToken: string): Promise<number> {
    return await this.redisClient.del(`refresh_token:${refreshToken}`);
  }
}
