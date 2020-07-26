import { Injectable } from '@nestjs/common';
import { TODO_ANY, AuthNetProxy } from './AuthNetProxy';

@Injectable()
export class AuthnetService {
  private readonly authNetProxy: AuthNetProxy;

  constructor() {
    const {
      AUTHNET_API_LOGIN_ID,
      AUTHNET_TRANSACTION_KEY,
      AUTHNET_ENVIRONMENT,
    } = process.env;
    this.authNetProxy = new AuthNetProxy(
      AUTHNET_API_LOGIN_ID,
      AUTHNET_TRANSACTION_KEY,
      AUTHNET_ENVIRONMENT,
    );
  }

  async getTransactionsDetails(
    transactionId: string,
  ): Promise<TODO_ANY | null> {
    return this.authNetProxy.getTransactionDetails(transactionId);
  }
}
