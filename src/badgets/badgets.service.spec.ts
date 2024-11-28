import { Test, TestingModule } from '@nestjs/testing';
import { BadgetsService } from './badgets.service';

describe('BadgetsService', () => {
  let service: BadgetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadgetsService],
    }).compile();

    service = module.get<BadgetsService>(BadgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
