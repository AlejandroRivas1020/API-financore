import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { parseMoney } from 'src/common/utils/typeMoney-validation.service';

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

    // validate and pass the amount
    const parsedAmount =
      typeof amount === 'number' ? amount : parseMoney(amount);
    console.log(`Amount parsed to money: ${parsedAmount}`);

    try {
      if (isNaN(parsedAmount)) {
        throw new Error(`Invalid amount provided: ${amount}`);
      }

      // Validate and sum `amountBudgeted`
      earning.amountBudgeted = parseFloat(
        earning.amountBudgeted?.toString().replace(/[^\d.-]/g, '') || '0',
      );

      console.log('Initial amountBudgeted:', earning.amountBudgeted);

      if (isNaN(earning.amountBudgeted)) {
        throw new Error('Invalid amountBudgeted detected in earning.');
      }

      earning.amountBudgeted += parsedAmount;

      console.log('Updated amountBudgeted:', earning.amountBudgeted);

      // save earning updated
      await this.earningRepository.save(earning);

      // create and save the updated budget
      const budget = this.budgetRepository.create({
        name,
        description,
        amount: parsedAmount,
        startDate,
        endDate,
        category,
        earning,
        user,
      });

      const savedBudget = await this.budgetRepository.save(budget);

      return {
        status: 201,
        data: {
          id: savedBudget.id,
          name: savedBudget.name,
          description: savedBudget.description,
          amount: parsedAmount.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
          }),
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
      console.error('Error creating budget:', error.message);
      throw new InternalServerErrorException(
        `Error saving budget: ${error.message}`,
      );
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
    const {
      id,
      name,
      description,
      amount,
      startDate,
      endDate,
      categoryId,
      earningId,
    } = updateBudgetDto;

    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['category', 'earning', 'user'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    if (budget.user.id !== userId) {
      throw new UnauthorizedException('You are not the owner of this budget');
    }

    const category = categoryId
      ? await this.categoryRepository.findOne({ where: { id: categoryId } })
      : budget.category;
    if (categoryId && !category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const earning = earningId
      ? await this.earningRepository.findOne({ where: { id: earningId } })
      : budget.earning;
    if (earningId && !earning) {
      throw new NotFoundException(`Earning with ID ${earningId} not found`);
    }

    if (amount !== undefined) {
      const parsedAmount =
        typeof amount === 'number' ? amount : parseMoney(amount);

      console.log(`Amount parsed to money: ${parsedAmount}`);

      if (isNaN(parsedAmount)) {
        throw new BadRequestException(`Invalid amount provided: ${amount}`);
      }

      const originalAmount = parseMoney(budget.amount.toString());
      console.log(`Original amount before any processing: ${originalAmount}`);

      earning.amountBudgeted = parseMoney(earning.amountBudgeted.toString());

      console.log('amountBudgeted after parseMoney:' + earning.amountBudgeted);

      if (isNaN(earning.amountBudgeted)) {
        throw new BadRequestException(
          `Invalid amountBudgeted in earning: ${earning.amountBudgeted}`,
        );
      }

      const updatedAmountBudgeted =
        earning.amountBudgeted - originalAmount + parsedAmount;

      console.log('Updated amountBudgeted calculation:');
      console.log(`earning.amountBudgeted: ${earning.amountBudgeted}`);
      console.log(`originalAmount: ${originalAmount}`);
      console.log(`parsedAmount: ${parsedAmount}`);
      console.log(`Updated amountBudgeted: ${updatedAmountBudgeted}`);

      if (isNaN(updatedAmountBudgeted)) {
        throw new BadRequestException(
          'Calculated updated amountBudgeted is NaN',
        );
      }

      earning.amountBudgeted = updatedAmountBudgeted;

      await this.earningRepository.save(earning);

      budget.amount = parsedAmount;
    }

    budget.name = name ?? budget.name;
    budget.description = description ?? budget.description;
    budget.startDate = startDate ?? budget.startDate;
    budget.endDate = endDate ?? budget.endDate;
    budget.category = category;
    budget.earning = earning;

    const updatedBudget = await this.budgetRepository.save(budget);

    return {
      status: 200,
      data: {
        id: updatedBudget.id,
        name: updatedBudget.name,
        description: updatedBudget.description,
        amount: updatedBudget.amount.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        }),
        startDate: updatedBudget.startDate,
        endDate: updatedBudget.endDate,
        category: {
          id: category.id,
          name: category.name,
        },
        earning: {
          id: earning.id,
          name: earning.name,
          amountBudgeted: earning.amountBudgeted.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
          }),
        },
        user: {
          id: budget.user.id,
          name: budget.user.name,
        },
      },
      message: 'Budget successfully updated',
    };
  }

  async deleteBudget(
    id: string,
    userId: string,
  ): Promise<ResponseBudgetDeleteDto> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['user', 'earning'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    if (budget.user.id !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this budget',
      );
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
