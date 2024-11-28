import { Test, TestingModule } from '@nestjs/testing';
import { BadgetsController } from './budgets.controller';
import { BadgetsService } from './budgets.service';

describe('BadgetsController', () => {
  let controller: BadgetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgetsController],
      providers: [BadgetsService],
    }).compile();

    controller = module.get<BadgetsController>(BadgetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
