import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { random } from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { WebhookDto } from '../src/authwebhook/dtos';

/**
 * Two minutes for jest test case.
 */
const LONG_ASYNC_DELAY = 120000;

describe('Authwebhook (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.setTimeout(LONG_ASYNC_DELAY);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/authwebhook (POST)', () => {
    const payload: WebhookDto = {
      notificationId: 'd0e8e7fe-c3e7-4add-a480-27bc5ce28a18',
      eventType: 'net.authorize.payment.authcapture.created',
      eventDate: new Date().toJSON(),
      webhookId: random.uuid(),
      payload: {
        responseCode: 1,
        merchantReferenceId: '19102146534003137356',
        authCode: 'LZ6I19',
        avsResponse: 'Y',
        authAmount: 45.0,
        entityName: 'transaction',
        id: '62734251801',
      },
    };
    return request(app.getHttpServer())
      .post('/authwebhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
  it('/authwebhook (refunded) (POST)', () => {
    const payload: WebhookDto = {
      notificationId: 'a144d641-5d1c-4f34-862e-ed5bcc4de74d',
      eventType: 'net.authorize.payment.refund.created',
      eventDate: new Date().toJSON(),
      webhookId: random.uuid(),
      payload: {
        responseCode: 1,
        avsResponse: 'P',
        authAmount: 100,
        invoiceNumber: '43244',
        entityName: 'transaction',
        id: '62734251801',
        merchantReferenceId: '1',
        authCode: '1',
      },
    };
    return request(app.getHttpServer())
      .post('/authwebhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
