import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // 1. 记录请求的基本信息
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    // 2. 记录请求参数 (query, params, body)
    this.logger.debug(`Request Query: ${JSON.stringify(req.query)}`);
    this.logger.debug(`Request Params: ${JSON.stringify(req.params)}`);
    this.logger.debug(`Request Body: ${JSON.stringify(req.body)}`);

    // 3. 为了记录响应体，需要对 res.write / res.end 进行一次“封装”
    //   - 备份原有方法
    const oldWrite = res.write;
    const oldEnd = res.end;

    // 用于存放响应的 buffer
    const chunks: Buffer[] = [];

    // 重写 res.write
    res.write = (...restArgs: any[]) => {
      const chunk = restArgs[0];
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      // 调用原有的 write 方法继续处理
      return oldWrite.apply(res, restArgs);
    };

    // 重写 res.end
    res.end = (...restArgs: any[]) => {
      const chunk = restArgs[0];
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      // 合并所有 chunk，得到最终的响应内容
      const responseBody = Buffer.concat(chunks).toString('utf8');

      // 这里可以按需要截断过长的响应
      this.logger.debug(`Response Body: ${responseBody}`);

      // 调用原有的 end 方法继续处理
      return oldEnd.apply(res, restArgs);
    };

    // 4. 在响应完成后记录整体日志
    res.on('finish', () => {
      const { statusCode } = res;
      // 这里可以打印简要的结果日志
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
