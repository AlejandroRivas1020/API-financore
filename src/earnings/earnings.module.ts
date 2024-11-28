import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Earning } from 'src/earnings/entities/earning.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Earning]), CommonModule],
  controllers: [EarningsController],
  providers: [EarningsService],
})
export class EarningsModule {}
