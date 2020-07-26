import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthwebhookModule } from './authwebhook/authwebhook.module';
import { TransactionsCreatedModule } from './transactions-created/transactions-created.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthnetModule } from './authnet/authnet.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
