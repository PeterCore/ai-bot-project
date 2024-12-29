import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { RedisService } from './common/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局拦截器，统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 需要先从 app.get() 获取 JwtService (前提：AppModule里有 JwtModule.forRoot(...) 或 AuthModule 里exports了 JwtService)
  // 获取 Reflector 和 JwtService 的实例
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const redisService = app.get(RedisService);

  app.useGlobalFilters(new AllExceptionsFilter());
  // 全局守卫
  app.useGlobalGuards(new JwtAuthGuard(reflector, jwtService, redisService));
  // ---------------^ 注意：我们需要把 reflector 也注入进来
  // 但是在上面定义 JwtAuthGuard 时，我们只写了 constructor(private reflector: Reflector, ...),
  // 所以需要先通过 app.get(Reflector) 获取 Reflector 实例
  // 启动监听端口
  const port = 3000;
  await app.listen(port);
  Logger.log(`Server is 12333 running on http://localhost:${port}`);
}
bootstrap();
