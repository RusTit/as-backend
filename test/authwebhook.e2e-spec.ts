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
      notificationId: 'd0e8e7fe-c3e7-4add-a480-27bc5ce28a18',
      eventType: 'net.authorize.payment.authcapture.created',
      eventDate: '2017-03-29T20:48:02.0080095Z',
      webhookId: '63d6fea2-aa13-4b1d-a204-f5fbc15942b7',
      payload: {
        responseCode: 1,
        merchantReferenceId: '19102146534003137356',
        authCode: 'LZ6I19',
        avsResponse: 'Y',
        authAmount: 45.0,
        entityName: 'transaction',
        id: '60020981676',
      },
    };
    return request(app.getHttpServer())
      .post('/authwebhook')
      .send(payload)
      .expect(200)
      .expect({ status: 'WebHook was successfully processed' });
  });
});
