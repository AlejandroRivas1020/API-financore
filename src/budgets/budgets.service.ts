import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { Budget } from './entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { Earning } from '../earnings/entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseBudgetDto } from './dto/create-badget.response.dto';
import { ResponseByIdDto } from './dto/getById.response.dto';
import { ResponseBudgetAllDto } from './dto/getAll.response.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,

    @InjectRepository(Earning)
    private readonly earningRepository: Repository<Earning>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBadgetDto: CreateBadgetDto): Promise<ResponseBudgetDto> {
    const {
      name,
      description,
      amount,
      startDate,
      endDate,
      categoryId,
      earningId,
      userId,
    } = createBadgetDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${categoryId} not found`);

    const earning = await this.earningRepository.findOne({
      where: { id: earningId },
    });
    if (!earning)
      throw new NotFoundException(`Earning with ID ${earningId} not found`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const budget = this.budgetRepository.create({
      name,
      description,
      amount,
      startDate,
      endDate,
      category,
      earning,
      user,
    });

    try {
      const savedBudget = await this.budgetRepository.save(budget);

      earning.amountBudgeted += amount;
      await this.earningRepository.save(earning);

      return {
        status: 201,
        data: {
          id: savedBudget.id,
          name: savedBudget.name,
          description: savedBudget.description,
          amount: savedBudget.amount,
          startDate: savedBudget.startDate,
          endDate: savedBudget.endDate,
          category: { id: category.id, name: category.name },
          earning: {
            id: earning.id,
            name: earning.name,
            amountBudgeted: earning.amountBudgeted,
          },
          user: { id: user.id, name: user.name },
        },
        message: 'Budget successfully created',
      };
    } catch (error) {
      throw new Error(`Error saving budget: ${error.message}`);
    }
  }

  async getAllBudgets(): Promise<ResponseBudgetAllDto> {
    const budgets = await this.budgetRepository.find({
      relations: ['category', 'earning', 'user'], // Asegúrate de cargar relaciones necesarias
    });

    const formattedBudgets = budgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
      description: budget.description,
      amount: budget.amount,
      startDate:
        budget.startDate instanceof Date
          ? budget.startDate.toISOString().split('T')[0]
          : new Date(budget.startDate).toISOString().split('T')[0],
      endDate:
        budget.endDate instanceof Date
          ? budget.endDate.toISOString().split('T')[0]
          : new Date(budget.endDate).toISOString().split('T')[0],
      category: budget.category
        ? { id: budget.category.id, name: budget.category.name }
        : null,
      earning: budget.earning
        ? { id: budget.earning.id, name: budget.earning.name }
        : null,
      user: budget.user ? { id: budget.user.id, name: budget.user.name } : null,
    }));

    return {
      status: 200,
      data: formattedBudgets,
      message: '¡Budgets finded succesfully!',
    };
  }

  async getById(id: string): Promise<ResponseByIdDto> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return {
      status: 200,
      data: budget,
      message: '¡Budget finded succesfully! ',
    };
  }
}
