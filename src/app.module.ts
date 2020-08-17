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
import { TransactionsProcessedModule } from './transactions-processed/transactions-processed.module';
import { TransactionsIssuesModule } from './transactions-issues/transactions-issues.module';
import { UiModule } from './ui/ui.module';
import { ProductsModule } from './products/products.module';

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
    TransactionsProcessedModule,
    TransactionsIssuesModule,
    UiModule,
    ProductsModule,
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
