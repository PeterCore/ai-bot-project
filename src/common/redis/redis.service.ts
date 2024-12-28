import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

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
}
