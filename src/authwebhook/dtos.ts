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
  @ApiProperty()
  responseCode: number;
  @ApiProperty()
  merchantReferenceId: string;
  @ApiProperty()
  authCode: string;
  @ApiProperty()
  avsResponse: string;
  @ApiProperty()
  authAmount: number;
  @ApiProperty()
  entityName: 'transaction';
  @ApiProperty()
  id: string;
}

export class WebhookDto {
  @ApiProperty()
  notificationId: string;
  @ApiProperty()
  eventType: WebHookEventType;
  @ApiProperty()
  eventDate: string;
  @ApiProperty()
  webhookId: string;
  @ApiProperty()
  payload: PayloadDto;
}

export class WebhookResultResponse {
  @ApiProperty()
  status: string;
  @ApiProperty()
  err?: string;
}
