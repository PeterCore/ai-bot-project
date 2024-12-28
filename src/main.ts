import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局拦截器，统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 启动监听端口
  const port = 3000;
  await app.listen(port);
  Logger.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
