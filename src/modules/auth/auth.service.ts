import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RedisService } from '../../common/redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}
  // private readonly logger = new Logger(AuthService.name);

  // 生成 token 并缓存到 Redis
  async generateToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload);
    await this.redisService.set(`token:${userId}`, token, 3600);
    await this.redisService.set(token, userId, 3600);
    return token;
  }

  // 手机验证码登录
  async loginWithPhone(phone: string, code: string) {
    // 验证短信 code，示例略
    let user = await this.userService.getUserByPhone(phone);
    if (!user) {
      user = await this.userService.createUser({ phone });
    }
    const token = await this.generateToken(user.userId);
    return { user, token };
  }

  // 邮箱验证码登录
  async loginWithEmail(email: string, code: string) {
    // 验证邮件 code，示例略
    let user = await this.userService.getUserByEmail(email);
    if (!user) {
      user = await this.userService.createUser({ email });
    }
    const token = await this.generateToken(user.userId);
    return { user, token };
  }

  // 微信登录
  async loginWithWeChat(providerId: string) {
    // 省略对接微信逻辑
    // 此处示例仅用 providerId 字段存储
    let user = await this.userService.getUserByEmail(providerId);
    if (!user) {
      user = await this.userService.createUser({
        provider: 'wechat',
        providerId,
      });
    }
    const token = await this.generateToken(user.userId);
    return { user, token };
  }

  // 用户名 + 密码登录
  async loginWithPassword(identifier: string, password: string) {
    // identifier 可能是 email/phone/userName
    let user: User | null = await this.userService.getUserByEmail(identifier);
    if (!user) {
      user = await this.userService.getUserByPhone(identifier);
    }
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please set your password first.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = await this.generateToken(user.userId);
    return { user, token };
  }

  // 设置密码
  async setPassword(userId: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.userService.updateUser(userId, { password: hash });
  }

  // 校验 token
  async validateToken(userId: string) {
    return this.userService.getUserById(userId);
  }
}
