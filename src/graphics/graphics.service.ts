import { Injectable } from '@nestjs/common';
import { CreateGraphicDto } from './dto/create-graphic.dto';
import { UpdateGraphicDto } from './dto/update-graphic.dto';

@Injectable()
export class GraphicsService {
  create(createGraphicDto: CreateGraphicDto) {
    return 'This action adds a new graphic';
  }

  findAll() {
    return `This action returns all graphics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} graphic`;
  }

  update(id: number, updateGraphicDto: UpdateGraphicDto) {
    return `This action updates a #${id} graphic`;
  }

  remove(id: number) {
    return `This action removes a #${id} graphic`;
  }
}
