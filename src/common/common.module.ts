import { Module } from '@nestjs/common';
import { DatesValidationService } from './utils/dates-validation.service';

@Module({
  providers: [DatesValidationService],
  exports: [DatesValidationService], 
})
export class CommonModule {}
