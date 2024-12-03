import { PartialType } from '@nestjs/swagger';
import { CreateGraphicDto } from './create-graphic.dto';

export class UpdateGraphicDto extends PartialType(CreateGraphicDto) {}
