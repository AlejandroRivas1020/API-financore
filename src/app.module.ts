import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './common/config/db.config';

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig)],
  controllers: [],
  providers: [],
})
export class AppModule {}
