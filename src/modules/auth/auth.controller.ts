import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 手机验证码
  @Post('login/phone')
  async loginWithPhone(@Body() body: { phone: string; code: string }) {
    return this.authService.loginWithPhone(body.phone, body.code);
  }

  // 邮箱验证码
  @Post('login/email')
  async loginWithEmail(@Body() body: { email: string; code: string }) {
    return this.authService.loginWithEmail(body.email, body.code);
  }

  // 微信登录
  @Post('login/wechat')
  async loginWithWeChat(@Body() body: { providerId: string }) {
    return this.authService.loginWithWeChat(body.providerId);
  }

  // 普通用户名/邮箱/手机号+密码登录
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
}
