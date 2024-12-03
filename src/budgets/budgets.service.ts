import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { Earning } from '../earnings/entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseBudgetDto } from './dto/create-budget.response.dto';
import { ResponseByIdDto } from './dto/getById.response.dto';
import { ResponseBudgetAllDto } from './dto/getAll.response.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ResponseBudgetUpdateDto } from './dto/update-budget.response.dto';
import { ResponseBudgetDeleteDto } from './dto/delete-budget.dto';

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

  async create(
    createBudgetDto: CreateBudgetDto,
    userId: string,
  ): Promise<ResponseBudgetDto> {
    const {
      name,
      description,
      amount,
      startDate,
      endDate,
      categoryId,
      earningId,
    } = createBudgetDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const earning = await this.earningRepository.findOne({
      where: { id: earningId },
    });
    if (!earning) {
      throw new NotFoundException(`Earning with ID ${earningId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

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
            amountBudgeted: earning.amountBudgeted.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
            }),
          },
          user: { id: user.id, name: user.name },
        },
        message: 'Budget successfully created',
      };
    } catch (error) {
      throw new Error(`Error saving budget: ${error.message}`);
    }
  }

  async getAllBudgets(userId: string): Promise<ResponseBudgetAllDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const budgets = await this.budgetRepository.find({
      where: { user: { id: userId } },
      relations: ['category', 'earning', 'user'],
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
      message: 'Budgets retrieved successfully!',
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
      message: '¡Budget found successfully! ',
    };
  }

  async updateBudget(
    updateBudgetDto: UpdateBudgetDto,
    userId: string,
  ): Promise<ResponseBudgetUpdateDto> {
    const budget = await this.budgetRepository.findOne({
      where: { id: updateBudgetDto.id },
      relations: ['category', 'earning', 'user'],
    });

    if (!budget) {
      throw new NotFoundException(
        `Budget with ID ${updateBudgetDto.id} not found`,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.id !== budget.user.id) {
      throw new UnauthorizedException('You are not the owner of this budget');
    }

    const category = updateBudgetDto.categoryId
      ? await this.categoryRepository.findOne({
          where: { id: updateBudgetDto.categoryId },
        })
      : budget.category;

    if (updateBudgetDto.categoryId && !category) {
      throw new NotFoundException(
        `Category with ID ${updateBudgetDto.categoryId} not found`,
      );
    }

    const earning = updateBudgetDto.earningId
      ? await this.earningRepository.findOne({
          where: { id: updateBudgetDto.earningId },
        })
      : budget.earning;

    if (updateBudgetDto.earningId && !earning) {
      throw new NotFoundException(
        `Earning with ID ${updateBudgetDto.earningId} not found`,
      );
    }

    budget.name = updateBudgetDto.name ?? budget.name;
    budget.description = updateBudgetDto.description ?? budget.description;
    budget.amount = updateBudgetDto.amount ?? budget.amount;
    budget.startDate = updateBudgetDto.startDate ?? budget.startDate;
    budget.endDate = updateBudgetDto.endDate ?? budget.endDate;
    budget.category = category;
    budget.earning = earning;

    try {
      const updatedBudget = await this.budgetRepository.save(budget);

      const response: ResponseBudgetUpdateDto = {
        status: 200,
        data: {
          id: updatedBudget.id,
          name: updatedBudget.name,
          description: updatedBudget.description,
          amount: updatedBudget.amount,
          startDate: updatedBudget.startDate,
          endDate: updatedBudget.endDate,
          category: {
            id: category.id,
            name: category.name,
          },
          earning: {
            id: earning.id,
            name: earning.name,
          },
          user: {
            id: user.id,
            name: user.name,
          },
        },
        message: 'Budget successfully updated',
      };

      return response;
    } catch (error) {
      throw new Error(`Error updating budget: ${error.message}`);
    }
  }

  async deleteBudget(
    id: string,
    userId: string,
  ): Promise<ResponseBudgetDeleteDto> {
    const budget = await this.budgetRepository.findOne({ where: { id } });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    try {
      await this.budgetRepository.delete(id);

      return {
        status: 200,
        message: 'Budget successfully deleted',
      };
    } catch (error) {
      throw new Error(`Error deleting budget: ${error.message}`);
    }
  }
}
