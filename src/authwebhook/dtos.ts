import { ApiProperty } from '@nestjs/swagger';

export type WebHookEventType =
  | 'net.authorize.payment.authorization.created'
  | 'net.authorize.payment.authcapture.created'
  | 'net.authorize.payment.capture.created'
  | 'net.authorize.payment.refund.created'
  | 'net.authorize.payment.priorAuthCapture.created'
  | 'net.authorize.payment.void.created';

export type WebhookPayloadType =
  | 'transaction'
  | 'customerProfile'
  | 'customerPaymentProfile'
  | 'subscription';

export class PayloadDto {
  @ApiProperty()
  entityName: WebhookPayloadType;
}

export class TransactionPayloadDto extends PayloadDto {
  @ApiProperty({
    example: 1,
  })
  responseCode: number;

  @ApiProperty({
    example: '19102146534003137356',
  })
  merchantReferenceId: string;

  @ApiProperty({
    example: 'LZ6I19',
  })
  authCode: string;

  @ApiProperty({
    example: 'Y',
  })
  avsResponse: string;

  @ApiProperty({
    example: 45.0,
  })
  authAmount: number;

  @ApiProperty({
    default: 'transaction',
  })
  entityName: 'transaction';

  @ApiProperty({
    example: '60020981676',
  })
  id: string;
}

export class WebhookDto {
  @ApiProperty({
    example: 'd0e8e7fe-c3e7-4add-a480-27bc5ce28a18',
  })
  notificationId: string;

  @ApiProperty({
    example: 'net.authorize.payment.authcapture.created',
  })
  eventType: WebHookEventType;

  @ApiProperty({
    example: '2017-03-29T20:48:02.0080095Z',
  })
  eventDate: string;

  @ApiProperty({
    example: '63d6fea2-aa13-4b1d-a204-f5fbc15942b7',
  })
  webhookId: string;
  @ApiProperty()
  payload: TransactionPayloadDto;
}

export class WebhookResultDto {
  @ApiProperty()
  status: string;
  @ApiProperty()
  err?: string;
}
