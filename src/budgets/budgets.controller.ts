import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { UpdateBadgetDto } from './dto/update-badget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body() createBadgetDto: CreateBadgetDto) {
    return this.budgetsService.create(createBadgetDto);
  }

  @Get()
  findAll() {
    return this.budgetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBadgetDto: UpdateBadgetDto) {
    return this.budgetsService.update(+id, updateBadgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(+id);
  }
}
