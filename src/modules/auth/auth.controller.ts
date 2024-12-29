import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Headers,
  Request,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // 手机验证码
  @Public()
  @Post('login/phone')
  async loginWithPhone(@Body() body: { phone: string; code: string }) {
    return this.authService.loginWithPhone(body.phone, body.code);
  }

  // 邮箱验证码
  @Public()
  @Post('login/email')
  async loginWithEmail(@Body() body: { email: string; code: string }) {
    return this.authService.loginWithEmail(body.email, body.code);
  }

  // 微信登录
  @Public()
  @Post('login/wechat')
  async loginWithWeChat(@Body() body: { providerId: string }) {
    return this.authService.loginWithWeChat(body.providerId);
  }

  // 普通用户名/邮箱/手机号+密码登录
  @Public()
  @Post('login/password')
  async loginWithPassword(
    @Body() body: { identifier: string; password: string },
  ) {
    return this.authService.loginWithPassword(body.identifier, body.password);
  }

  // 设置密码
  @Post('set-password')
  async setPassword(@Body() body: { userId: string; password: string }) {
    return this.authService.setPassword(body.userId, body.password);
  }

  /**
   * 通过请求头中的 token 获取用户信息
   * @param authorization 请求头中的 Authorization: Bearer <token>
   */
  /**
   * 获取用户信息接口，需要验证 Token
   */
  @Get('user-info')
  async getUserInfo(@Request() req) {
    const userId = req.user.userId;
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      code: 0,
      message: 'Success',
      data: user,
    };
  }
}
