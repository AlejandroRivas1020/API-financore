import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BadgetsService } from './badgets.service';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { UpdateBadgetDto } from './dto/update-badget.dto';

@Controller('badgets')
export class BadgetsController {
  constructor(private readonly badgetsService: BadgetsService) {}

  @Post()
  create(@Body() createBadgetDto: CreateBadgetDto) {
    return this.badgetsService.create(createBadgetDto);
  }

  @Get()
  findAll() {
    return this.badgetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.badgetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBadgetDto: UpdateBadgetDto) {
    return this.badgetsService.update(+id, updateBadgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.badgetsService.remove(+id);
  }
}
