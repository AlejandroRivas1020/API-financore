import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './common/config/db.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EarningsModule } from './earnings/earnings.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GraphicsModule } from './graphics/graphics.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GraphicsScheduler } from './graphics/graphics.scheduler';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    AuthModule,
    BudgetsModule,
    EarningsModule,
    CategoriesModule,
    GraphicsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [GraphicsScheduler, CommonModule],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly graphicsScheduler: GraphicsScheduler) {}

  onModuleInit() {
    this.graphicsScheduler.startBroadcasting(10000);
  }
}
