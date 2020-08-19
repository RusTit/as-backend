import { ApiProperty } from '@nestjs/swagger';

export class WebHookBaseDto {
  @ApiProperty({
    example: '1025646',
  })
  store_id: string;

  @ApiProperty({
    example: '7ee67cd1cf2ca60bc1aa9e5fe957d2de373be4ca',
  })
  hash: string;

  @ApiProperty({
    example: 1561479335,
  })
  created_at: number;

  @ApiProperty({
    example: 'stores/{store_hash}',
  })
  producer: string;
}

export type UpdatedScope = 'store/order/statusUpdated' | 'store/order/updated';

export class UpdatedStatus {
  @ApiProperty({
    example: 0,
  })
  previous_status_id: number;

  @ApiProperty({
    example: 11,
  })
  new_status_id: number;
}

export class UpdatedData {
  @ApiProperty()
  type: 'order';

  @ApiProperty({
    example: 250,
  })
  id: number;

  @ApiProperty()
  status: UpdatedStatus;
}

export class WebhookUpdatedDto extends WebHookBaseDto {
  @ApiProperty({
    example: 'store/order/statusUpdated',
  })
  scope: UpdatedScope;

  @ApiProperty()
  data: UpdatedData;
}
