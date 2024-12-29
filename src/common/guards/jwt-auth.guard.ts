// src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    this.logger.log(`All headers: ${JSON.stringify(request.headers)}`);
    const authorization = request.headers['authorization'] || '';
    if (!authorization) {
      throw new HttpException(
        'Missing Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : authorization;

    try {
      // 验证 Token 是否有效
      const payload = this.jwtService.verify(token);

      // 从 Redis 查询 Token 是否存在
      const userId = await this.redisService.get(token);
      if (!userId) {
        throw new HttpException(
          'Token invalid or expired',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 将 userId 注入请求对象
      request.user = { userId };

      return true;
    } catch (error) {
      this.logger.error(error.message || error);
      throw new HttpException(
        'Token invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
