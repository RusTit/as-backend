import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from './Error.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(Error)
    private errorRepository: Repository<Error>,
  ) {}

  async saveError(exception: unknown): Promise<void> {
    try {
      let message = 'Unknown';
      if (exception instanceof HttpException) {
        message = exception.message;
      } else if (exception instanceof Error) {
        message = exception.message;
      }
      const dbError = new Error();
      dbError.message = message;
      await this.errorRepository.save(dbError);
    } catch (e) {
      Logger.error(e);
    }
  }
}
