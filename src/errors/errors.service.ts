import { Injectable } from '@nestjs/common';
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

  async findAll(skip = 0, take = 100): Promise<Error[]> {
    return this.errorRepository.find({
      skip,
      take,
    });
  }

  async saveError(exception: any): Promise<void> {
    try {
      const message = exception.message ? exception.message : 'Unknown';
      const dbError = new Error();
      dbError.message = message;
      await this.errorRepository.save(dbError);
    } catch (e) {
      Logger.error(e);
    }
  }
}
