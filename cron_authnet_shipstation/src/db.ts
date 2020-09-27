import { Connection, createConnection, EntityManager } from 'typeorm';
import { TransactionCreatedEntity } from './entities/TransactionCreated.entity';
import { TransactionProcessedEntity } from './entities/TransactionProcessed.entity';
import { TransactionIssuesEntity } from './entities/TransactionIssues.entity';
import { SystemHealthEntity } from './entities/SystemHealth.entity';
import * as Helper from './Helper';
import { ProductEntity } from './entities/Product.entity';
import { GroupEntity } from './entities/Group.entity';
import Logger from './logger';

const logger = Logger('src/db.ts');

let connection: Connection | undefined;
export async function initDbConnection(): Promise<Connection> {
  if (!connection) {
    connection = await createConnection();
  }
  return connection;
}

export async function getDbTransactionsCreated(): Promise<
  TransactionCreatedEntity[]
> {
  const con = await initDbConnection();
  const repository = con.getRepository(TransactionCreatedEntity);
  return repository.find({
    order: {
      transactionId: 'ASC',
    },
    select: ['id', 'transactionId'],
  });
}

export async function removeDbTransactionsCreated(
  transactionCreatedEntities: TransactionCreatedEntity[]
): Promise<void> {
  const con = await initDbConnection();
  const repository = con.getRepository(TransactionCreatedEntity);
  await repository.remove(transactionCreatedEntities);
}

export async function getDbTransactionsProcessed(): Promise<
  TransactionProcessedEntity[]
> {
  const con = await initDbConnection();
  const repository = con.getRepository(TransactionProcessedEntity);
  return repository.find({
    order: {
      transactionId: 'ASC',
    },
    select: ['id', 'transactionId'],
  });
}

export async function getProductsFromTheDb(): Promise<ProductEntity[]> {
  const con = await initDbConnection();
  const repository = con.getRepository(ProductEntity);
  return repository.find({});
}

export async function removeTransactionFromTheCreated(
  transId: number | string
): Promise<void> {
  const con = await initDbConnection();
  await con.transaction(async (transactionalEntityManager: EntityManager) => {
    await transactionalEntityManager.delete(TransactionCreatedEntity, {
      transactionId: transId,
    });
  });
}

export async function moveProcessedTransaction(
  transactionDetails: Helper.TODO_ANY,
  orderResponsePayload: Helper.TODO_ANY,
  labelResponsePayload: Helper.TODO_ANY = {
    todo: 'temp stub',
  }
): Promise<void> {
  const con = await initDbConnection();
  await con.transaction(async (transactionalEntityManager: EntityManager) => {
    const transactionsArr = Array.isArray(transactionDetails)
      ? transactionDetails
      : [transactionDetails];
    await Promise.all(
      transactionsArr.map(async tran => {
        const { transId } = tran;
        await transactionalEntityManager.delete(TransactionCreatedEntity, {
          transactionId: transId,
        });
        const existingProcessed = await transactionalEntityManager.findOne(
          TransactionProcessedEntity,
          {
            where: {
              transactionId: transId,
            },
          }
        );
        if (existingProcessed) {
          logger.warn(
            `Duplicate existing ${transId}. Skipping save (${JSON.stringify(
              transactionsArr
            )}). Please check the logs`
          );
        } else {
          const newProcessedDbRow = new TransactionProcessedEntity();
          newProcessedDbRow.transactionId = transId;
          newProcessedDbRow.orderObject = orderResponsePayload;
          newProcessedDbRow.labelObject = labelResponsePayload;
          await transactionalEntityManager.save(newProcessedDbRow);
        }
      })
    );
  });
}

export async function moveIssuedTransaction(
  transactionDetails: Helper.TODO_ANY,
  issue: Error
): Promise<void> {
  const con = await initDbConnection();
  await con.transaction(async (transactionalEntityManager: EntityManager) => {
    const transactionsArr = Array.isArray(transactionDetails)
      ? transactionDetails
      : [transactionDetails];
    await Promise.all(
      transactionsArr.map(async tran => {
        const { transId } = tran;
        await transactionalEntityManager.delete(TransactionCreatedEntity, {
          transactionId: transId,
        });
        const newIssuedDbRow = new TransactionIssuesEntity();
        newIssuedDbRow.transactionId = transId;
        newIssuedDbRow.issueObject = {
          error: issue,
          message: issue.message,
        };
        await transactionalEntityManager.save(newIssuedDbRow);
      })
    );
  });
}

export function convertRecordsIntoArrayOfTransactionsIds(
  records: TransactionCreatedEntity[]
): Array<string> {
  return records.map(record => record.transactionId);
}

export async function saveSystemEventEvent(message: string): Promise<void> {
  const con = await initDbConnection();
  const repository = con.getRepository(SystemHealthEntity);
  const newRow = new SystemHealthEntity();
  newRow.message = message;
  await repository.save(newRow);
}

export async function getAllGroups(): Promise<GroupEntity[]> {
  const con = await initDbConnection();
  const repository = con.getRepository(GroupEntity);
  return repository.find();
}
