import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { random } from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { WebhookDto } from '../src/authwebhook/dtos';

describe('Authwebhook (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
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
        id: random.number({ min: 1000000, max: 9999999 }).toString(),
      },
    };
    return request(app.getHttpServer())
      .post('/authwebhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
