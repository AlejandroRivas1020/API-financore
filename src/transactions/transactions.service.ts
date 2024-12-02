import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { BudgetsService } from 'src/budgets/budgets.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly budgetService: BudgetsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { amount, description, budgetId } = createTransactionDto;

    const budget = await this.budgetService.getById(budgetId);

    return 'This action adds a new transaction';
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }
}
