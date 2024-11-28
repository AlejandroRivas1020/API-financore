import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './common/config/db.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BadgetsModule } from './badgets/badgets.module';
import { EarningsModule } from './earnings/earnings.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig), UsersModule, AuthModule, BadgetsModule, EarningsModule, CategoriesModule],
  controllers: [],
  providers: [
    CommonModule
  ],
})
export class AppModule {}
