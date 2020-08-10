// eslint-disable-next-line @typescript-eslint/no-var-requires
const authorizenet = require('authorizenet');
import { Logger } from 'log4js';
import LoggerFactory from './logger';
import { TODO_ANY } from './Helper';

const ApiContracts = authorizenet.APIContracts;
const SDKConstants = authorizenet.Constants;
const ApiControllers = authorizenet.APIControllers;

const runCtrl = async (ctrl: TODO_ANY) => {
  return new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      if (apiResponse) {
        resolve(apiResponse);
      } else {
        reject('Null response');
      }
    });
  });
};

const createError = (response: TODO_ANY): Error => {
  let errorMessage =
    'Result Code: ' + response.getMessages().getResultCode() + '\n';
  errorMessage +=
    'Error Code: ' + response.getMessages().getMessage()[0].getCode() + '\n';
  errorMessage +=
    'Error message: ' + response.getMessages().getMessage()[0].getText() + '\n';
  return new Error(errorMessage);
};

const TRANSACTIONS_LIMIT_COUNT = 1000;

export default class AuthNetProxy {
  private readonly apiLoginId: string;
  private readonly transactionKey: string;
  private readonly environment: string;
  private readonly logger: Logger;

  constructor(
    apiLoginId: string,
    transactionKey: string,
    environment = 'test'
  ) {
    this.apiLoginId = apiLoginId;
    this.transactionKey = transactionKey;
    this.environment = environment;
    this.logger = LoggerFactory('src/AuthNetProxy.ts');
    this.logger.debug(
      `Credentials: ${apiLoginId}, ${transactionKey}, ${environment}`
    );
  }

  setCtrlSettings(ctrl: TODO_ANY): void {
    switch (this.environment) {
      case 'test':
      default:
        ctrl.setEnvironment(SDKConstants.endpoint.sandbox);
        break;
      case 'production':
      case 'prod':
        ctrl.setEnvironment(SDKConstants.endpoint.production);
        break;
    }
  }

  createMerchantAuthenticationType(): TODO_ANY {
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(this.apiLoginId);
    merchantAuthenticationType.setTransactionKey(this.transactionKey);
    return merchantAuthenticationType;
  }

  async getBatchIds(from: Date, to: Date): Promise<Array<string>> {
    const merchantAuthenticationType = this.createMerchantAuthenticationType();
    const createRequest = new ApiContracts.GetSettledBatchListRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setFirstSettlementDate(from.toISOString());
    createRequest.setLastSettlementDate(to.toISOString());
    const jsonRequest = createRequest.getJSON();

    const ctrl = new ApiControllers.GetSettledBatchListController(jsonRequest);
    this.setCtrlSettings(ctrl);
    const result: Array<string> = [];

    const apiResponse = await runCtrl(ctrl);
    const response = new ApiContracts.GetSettledBatchListResponse(apiResponse);
    if (
      response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK
    ) {
      this.logger.debug(
        'Message Code : ' + response.getMessages().getMessage()[0].getCode()
      );
      this.logger.debug(
        'Message Text : ' + response.getMessages().getMessage()[0].getText()
      );

      if (response.getBatchList() != null) {
        const batchItems = response.getBatchList().getBatch();
        for (let i = 0; i < batchItems.length; i++) {
          const batchId = batchItems[i].getBatchId();
          result.push(batchId);
        }
      }
    } else {
      throw createError(response);
    }

    return result;
  }

  /**
   * @deprecated - This is debug prototype (DON'T USE IT)
   */
  async getUnsettledTransactionList(): Promise<Array<number>> {
    const merchantAuthenticationType = this.createMerchantAuthenticationType();
    const result: Array<number> = [];
    const getRequest = new ApiContracts.GetUnsettledTransactionListRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setStatus(ApiContracts.TransactionGroupStatusEnum.ANY);
    const jsonRequest = getRequest.getJSON();

    const ctrl = new ApiControllers.GetUnsettledTransactionListController(
      jsonRequest
    );
    this.setCtrlSettings(ctrl);

    const apiResponse = await runCtrl(ctrl);
    const response = new ApiContracts.GetUnsettledTransactionListResponse(
      apiResponse
    );

    return result;
  }

  async getTransactionsIdList(batchId: string): Promise<Array<string>> {
    const merchantAuthenticationType = this.createMerchantAuthenticationType();
    const result: Array<string> = [];
    let isFinished = false;
    let offset = 1;
    do {
      const getRequest = new ApiContracts.GetTransactionListRequest();

      const paging = new ApiContracts.Paging();
      paging.setLimit(TRANSACTIONS_LIMIT_COUNT);
      paging.setOffset(offset);

      getRequest.setPaging(paging);
      getRequest.setMerchantAuthentication(merchantAuthenticationType);
      getRequest.setBatchId(batchId);
      const jsonRequest = getRequest.getJSON();

      const ctrl = new ApiControllers.GetTransactionListController(jsonRequest);
      this.setCtrlSettings(ctrl);

      const apiResponse = await runCtrl(ctrl);
      const response = new ApiContracts.GetTransactionListResponse(apiResponse);

      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        this.logger.debug(
          'Message Code : ' + response.getMessages().getMessage()[0].getCode()
        );
        this.logger.debug(
          'Message Text : ' + response.getMessages().getMessage()[0].getText()
        );
        isFinished = true;
        if (response.getTransactions() != null) {
          const transactions = response.getTransactions().getTransaction();
          for (let i = 0; i < transactions.length; i++) {
            const transactionId = transactions[i].getTransId();
            result.push(transactionId);
          }
          if (transactions.length === TRANSACTIONS_LIMIT_COUNT) {
            offset += TRANSACTIONS_LIMIT_COUNT;
            isFinished = false;
          }
        }
      } else {
        throw createError(response);
      }
    } while (!isFinished);
    return result;
  }

  async getTransactionDetails(transactionId: string): Promise<TODO_ANY | null> {
    const merchantAuthenticationType = this.createMerchantAuthenticationType();
    const getRequest = new ApiContracts.GetTransactionDetailsRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setTransId(transactionId);
    const jsonRequest = getRequest.getJSON();

    const ctrl = new ApiControllers.GetTransactionDetailsController(
      jsonRequest
    );
    this.setCtrlSettings(ctrl);
    let result = null;

    const apiResponse = await runCtrl(ctrl);
    const response = new ApiContracts.GetTransactionDetailsResponse(
      apiResponse
    );
    if (
      response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK
    ) {
      const transactionDetailsObject = response.getTransaction();
      this.logger.debug(
        'Transaction Id : ' + transactionDetailsObject.getTransId()
      );
      result = transactionDetailsObject;
      this.logger.debug(
        'Message Code : ' + response.getMessages().getMessage()[0].getCode()
      );
      this.logger.debug(
        'Message Text : ' + response.getMessages().getMessage()[0].getText()
      );
    } else {
      throw createError(response);
    }

    return result;
  }
}
