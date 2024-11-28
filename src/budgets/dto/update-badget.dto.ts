import { PartialType } from '@nestjs/swagger';
import { CreateBadgetDto } from './create-badget.dto';

export class UpdateBadgetDto extends PartialType(CreateBadgetDto) {}
