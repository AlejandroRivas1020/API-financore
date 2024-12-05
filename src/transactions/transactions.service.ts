import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { BudgetsService } from 'src/budgets/budgets.service';
import { parseMoney } from 'src/common/utils/typeMoney-validation.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly budgetService: BudgetsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const { amount, description, budgetId } = createTransactionDto;

    try {
      const budget = (await this.budgetService.getById(budgetId)).data;

      const budgetAmount = amount + parseMoney(budget.amount);

      const transaction = this.transactionRepository.create({
        amount,
        description,
        budget: { id: budgetId },
      });

      await this.budgetService.updateBudget(
        { amount: budgetAmount, id: budgetId },
        userId,
      );

      return await this.transactionRepository.save(transaction);
    } catch (error: any) {
      throw new Error(error);
    }
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
