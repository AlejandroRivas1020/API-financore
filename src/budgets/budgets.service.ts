import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { Budget } from './entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { Earning } from '../earnings/entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseBudgetDto } from './dto/create-badget.response.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Earning)
    private readonly earningRepository: Repository<Earning>,

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

    // Verificar existencia de las entidades relacionadas
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

    // Crear y guardar el presupuesto
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

      // Construir la respuesta esperada
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
          earning: { id: earning.id, name: earning.name },
          user: { id: user.id, name: user.name },
        },
        message: 'Budget successfully created',
      };
    } catch (error) {
      throw new Error(`Error saving budget: ${error.message}`);
    }
  }
}
