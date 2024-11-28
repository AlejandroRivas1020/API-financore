import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Earning } from 'src/earnings/entities/earning.entity';
import { Budget } from './entities/budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Earning, Category, User])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
