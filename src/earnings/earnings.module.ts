import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Earning } from 'src/earnings/entities/earning.entity';
import { CommonModule } from 'src/common/common.module';
import { Budget } from 'src/budgets/entities/budget.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EarningGateway } from 'src/common/gateways/earnings.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Earning, Budget, User]),
    CommonModule,
    AuthModule,
  ],
  controllers: [EarningsController],
  providers: [EarningsService, EarningGateway],
  exports: [EarningsService, EarningGateway],
})
export class EarningsModule {}
