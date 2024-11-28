import { Module } from '@nestjs/common';
import { BadgetsService } from './badgets.service';
import { BadgetsController } from './badgets.controller';

@Module({
  controllers: [BadgetsController],
  providers: [BadgetsService],
})
export class BadgetsModule {}
