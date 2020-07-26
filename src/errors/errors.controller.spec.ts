import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsController } from './errors.controller';
import { ErrorsService } from './errors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Error } from './Error.entity';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<Error[]> {
    return [];
  },
};

describe('Errors Controller', () => {
  let controller: ErrorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorsController],
      providers: [
        ErrorsService,
        {
          provide: getRepositoryToken(Error),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<ErrorsController>(ErrorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
