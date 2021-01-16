import { ApiProperty } from '@nestjs/swagger';

export type ResourceType =
  | 'ORDER_NOTIFY'
  | 'ITEM_ORDER_NOTIFY'
  | 'SHIP_NOTIFY'
  | 'ITEM_SHIP_NOTIFY';

export class WebHookPayload {
  @ApiProperty({
    type: 'url',
  })
  resource_url: string;

  @ApiProperty({
    type: 'string',
  })
  resource_type: ResourceType;
}
