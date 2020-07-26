import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsService } from './errors.service';
import { Error } from './Error.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<Error[]> {
    return [];
  },
};

describe('ErrorsService', () => {
  let service: ErrorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorsService,
        {
          provide: getRepositoryToken(Error),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ErrorsService>(ErrorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
