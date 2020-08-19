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
      scope: 'store/order/statusUpdated',
      store_id: '1025646',
      data: {
        type: 'order',
        id: 34091,
        status: {
          previous_status_id: 7,
          new_status_id: 11,
        },
      },
      hash: '7ee67cd1cf2ca60bc1aa9e5fe957d2de373be4ca',
      created_at: 1561479335,
      producer: 'stores/{store_hash}',
    };
    return request(app.getHttpServer())
      .post('/bigcomhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
