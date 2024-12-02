import { PartialType } from '@nestjs/swagger';
import { CreateBadgetDto } from './create-budget.dto';

export class UpdateBadgetDto extends PartialType(CreateBadgetDto) {}
