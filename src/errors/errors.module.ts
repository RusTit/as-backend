import { Module } from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { ErrorsController } from './errors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Error } from './Error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Error])],
  providers: [ErrorsService],
  exports: [ErrorsService],
  controllers: [ErrorsController],
})
export class ErrorsModule {}
