import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthwebhookModule } from './authwebhook/authwebhook.module';
import { TransactionsCreatedModule } from './transactions-created/transactions-created.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(),
    AuthwebhookModule,
    TransactionsCreatedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
