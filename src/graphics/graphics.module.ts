import { Module } from '@nestjs/common';
import { GraphicsService } from './graphics.service';
import { GraphicsController } from './graphics.controller';
import { EarningsModule } from 'src/earnings/earnings.module';
import { GraphicsScheduler } from './graphics.scheduler';
import { EarningGateway } from 'src/common/gateways/earnings.gateway';

@Module({
  imports: [EarningsModule],
  controllers: [GraphicsController],
  providers: [GraphicsService, GraphicsScheduler, EarningGateway],
})
export class GraphicsModule {}
