import { Test, TestingModule } from '@nestjs/testing';
import { ShipstationhookController } from './shipstationhook.controller';
import { ShipstationhookService } from './shipstationhook.service';

describe('ShipstationhookController', () => {
  let controller: ShipstationhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipstationhookController],
      providers: [ShipstationhookService],
    }).compile();

    controller = module.get<ShipstationhookController>(
      ShipstationhookController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
