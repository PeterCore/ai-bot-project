import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 判断是否为 HttpException
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // 取出抛出的响应体，可能是字符串或对象
      const excResponse = exception.getResponse();
      message =
        typeof excResponse === 'string'
          ? excResponse
          : (excResponse as any).message || JSON.stringify(excResponse);
    } else {
      // 非 HttpException，可以是其他错误
      message = exception.message || message;
    }

    // 记录日志
    this.logger.error(`Status: ${status} Error: ${message}`);

    // 返回自定义结构
    response.status(status).json({
      code: status,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
