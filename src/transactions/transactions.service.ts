import { Injectable, NotFoundException } from '@nestjs/common';
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

    console.log({ amount, description, budget });

    const transaction = this.transactionRepository.create({
      amount,
      description,
    });

    await this.transactionRepository.save(transaction);
    // await this.budgetService.updateBudget({amount, id: budgetId})

    return 'This action adds a new transaction';
  }

  async findAll(userId: string) {
    const result = await this.transactionRepository.find({
      where: { budget: { user: { id: userId } } },
      relations: ['budget', 'budget.user'],
    });

    if (result.length === 0) {
      throw new NotFoundException('No transactions found associated with user');
    }

    return result;
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOneBy({ id });

    if (!transaction)
      throw new NotFoundException(`Transaction with ID ${id} not found`);

    return transaction;
  }
}
