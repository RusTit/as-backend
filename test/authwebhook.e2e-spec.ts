import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
      eventDate: new Date().toJSON(),
      eventType: 'net.authorize.payment.authcapture.created',
      notificationId: 'sdf',
      payload: {
        entityName: 'transaction'
      },
      webhookId: 'sdf',
    };
    return request(app.getHttpServer())
      .post('/authwebhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
