import { Test, TestingModule } from '@nestjs/testing';
import { ShipstationhookService } from './shipstationhook.service';

describe('ShipstationhookService', () => {
  let service: ShipstationhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipstationhookService],
    }).compile();

    service = module.get<ShipstationhookService>(ShipstationhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
