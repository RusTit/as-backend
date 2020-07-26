import { Controller, Get, Query } from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { ListErrorsQuery } from './dtos';

import { Error } from './Error.entity';

@Controller('errors')
export class ErrorsController {
  constructor(private readonly errorsService: ErrorsService) {}

  @Get()
  async findAll(@Query() options?: ListErrorsQuery): Promise<Error[]> {
    return this.errorsService.findAll(options.skip, options.take);
  }
}
