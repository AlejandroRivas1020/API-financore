import { Test, TestingModule } from '@nestjs/testing';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';

describe('EarningsController', () => {
  let controller: EarningsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EarningsController],
      providers: [EarningsService],
    }).compile();

    controller = module.get<EarningsController>(EarningsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
