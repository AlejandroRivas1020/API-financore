import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { UpdateEarningDto } from './dto/update-earning.dto';

@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Post()
  create(@Body() createEarningDto: CreateEarningDto) {
    return this.earningsService.create(createEarningDto);
  }

  @Get()
  findAll() {
    return this.earningsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.earningsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEarningDto: UpdateEarningDto) {
    return this.earningsService.update(+id, updateEarningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.earningsService.remove(+id);
  }
}
