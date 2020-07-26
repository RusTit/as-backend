import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthwebhookModule } from './authwebhook/authwebhook.module';
import { TransactionsCreatedModule } from './transactions-created/transactions-created.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthnetModule } from './authnet/authnet.module';
import { ErrorsModule } from './errors/errors.module';
import { AllExceptionsFilter } from './AllExceptionsFilter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(),
    AuthwebhookModule,
    TransactionsCreatedModule,
    AuthModule,
    UsersModule,
    AuthnetModule,
    ErrorsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
