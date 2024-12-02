import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Earning } from 'src/earnings/entities/earning.entity';
import { Budget } from './entities/budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from '../common/utils/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Earning, Category, User]),
    ScheduleModule.forRoot(),
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService, NotificationService],
})
export class BudgetsModule {}
