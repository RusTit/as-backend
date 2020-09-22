import {
  Logger,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorsService } from './errors/errors.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorsService: ErrorsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.errorsService.saveError(exception).finally(() => {
      Logger.debug('Error is saved');
    });

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(`${request.url} ${status}`);

    if (exception instanceof HttpException) {
      switch (status) {
        case 403:
          return response.redirect('/');
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
