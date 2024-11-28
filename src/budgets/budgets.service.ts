import { Injectable } from '@nestjs/common';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { UpdateBadgetDto } from './dto/update-badget.dto';

@Injectable()
export class BudgetsService {
  create(createBadgetDto: CreateBadgetDto) {
    return 'This action adds a new badget';
  }

  findAll() {
    return `This action returns all badgets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} badget`;
  }

  update(id: number, updateBadgetDto: UpdateBadgetDto) {
    return `This action updates a #${id} badget`;
  }

  remove(id: number) {
    return `This action removes a #${id} badget`;
  }
}
