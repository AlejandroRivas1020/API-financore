import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';

@Module({
  controllers: [EarningsController],
  providers: [EarningsService],
})
export class EarningsModule {}
