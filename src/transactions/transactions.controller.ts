import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create a new transaction with the given data and linking it to a budget',
  })
  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any,
  ) {
    const { userId } = req.user;

    return this.transactionsService.create(createTransactionDto, userId);
  }

  @ApiOperation({
    summary: 'Get all transactions of user',
  })
  @Get()
  findAll(@Request() req: any) {
    const { userId } = req.user;
    return this.transactionsService.findAll(userId);
  }

  @ApiOperation({
    summary: 'Get a transaction by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}
