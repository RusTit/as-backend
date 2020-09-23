import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { WebhookUpdatedDto } from '../src/bigcomhook/dtos';

/**
 * Two minutes for jest test case.
 */
const LONG_ASYNC_DELAY = 120000;

describe('BigCommerceHook (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.setTimeout(LONG_ASYNC_DELAY);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/bigcomhook (POST)', () => {
    const payload: WebhookUpdatedDto = {
      created_at: 1599828823,
      store_id: '1000249567',
      producer: 'stores/jkfuhlnu8d',
      scope: 'store/order/statusUpdated',
      hash: 'da032557d2ae314c3e698a051d9792b43965e3b9',
      data: {
        type: 'order',
        id: 36081, // 35797, // 35791, // 35626 - no transactionId,
        status: {
          previous_status_id: 0,
          new_status_id: 6,
        },
      },
    };
    return request(app.getHttpServer())
      .post('/bigcomhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
  it('/bigcomhook delete (POST)', () => {
    const payload: WebhookUpdatedDto = {
      created_at: 1599828823,
      store_id: '1000249567',
      producer: 'stores/jkfuhlnu8d',
      scope: 'store/order/statusUpdated',
      hash: 'da032557d2ae314c3e698a051d9792b43965e3b9',
      data: {
        type: 'order',
        id: 36081, // 35797, // 35791, // 35626 - no transactionId,
        refund: {
          refund_id: 3,
        },
      },
    };
    return request(app.getHttpServer())
      .post('/bigcomhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
