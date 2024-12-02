import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './common/config/db.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EarningsModule } from './earnings/earnings.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { BudgetsModule } from './budgets/budgets.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    AuthModule,
    BudgetsModule,
    EarningsModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [CommonModule],
})
export class AppModule {}
