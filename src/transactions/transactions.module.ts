import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { BudgetsModule } from '../budgets/budgets.module';
import { BudgetsService } from 'src/budgets/budgets.service';
import { Budget } from 'src/budgets/entities/budget.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Earning } from 'src/earnings/entities/earning.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Budget, Earning, Category, User]),
    BudgetsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    BudgetsService,
    UsersService,
    CloudinaryService,
  ],
})
export class TransactionsModule {}
