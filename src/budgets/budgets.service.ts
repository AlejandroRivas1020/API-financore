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
import { NotificationService } from '../common/utils/notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

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

    private readonly notificationService: NotificationService,
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

    const generalAmount = parseMoney(earning.generalAmount);
    const amountBudgeted = parseMoney(earning.amountBudgeted);

    if (isNaN(generalAmount) || isNaN(amountBudgeted)) {
      throw new Error('Invalid amount format in earning.');
    }

    const availableAmount = generalAmount - amountBudgeted;

    if (amount > availableAmount) {
      const notificationTitle = 'Budget Exceeded!';
      const notificationMessage = `You have exceeded your available funds. Budget: ${amount}, Available: ${availableAmount}`;
      await this.notificationService.sendNotification(
        user.id,
        notificationTitle,
        notificationMessage,
      );
    }

    const parsedAmount =
      typeof amount === 'number' ? amount : parseMoney(amount);
    console.log(`Amount parsed to money: ${parsedAmount}`);

    const queryRunner =
      this.budgetRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      if (isNaN(parsedAmount)) {
        throw new Error(`Invalid amount provided: ${amount}`);
      }

      earning.amountBudgeted = parseFloat(
        earning.amountBudgeted?.toString().replace(/[^\d.-]/g, '') || '0',
      );

      if (isNaN(earning.amountBudgeted)) {
        throw new Error('Invalid amountBudgeted detected in earning.');
      }

      earning.amountBudgeted += parsedAmount;

      console.log('Updated amountBudgeted:', earning.amountBudgeted);

      await queryRunner.manager.save(earning);

      const budget = this.budgetRepository.create({
        name,
        description,
        amount: parsedAmount,
        startDate,
        endDate,
        category,
        earning,
        user,
        amountSpent: 0,
      });

      const savedBudget = await queryRunner.manager.save(budget);

      if (!savedBudget) {
        throw new Error('Failed to save budget');
      }

      await queryRunner.commitTransaction();

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
      await queryRunner.rollbackTransaction();
      console.error('Error creating budget:', error.message);
      throw new InternalServerErrorException(
        `Error saving budget: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
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
      amountSpent: budget.amountSpent,
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
      relations: ['category', 'earning', 'user'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const formattedBudget = {
      id: budget.id,
      name: budget.name,
      description: budget.description,
      amount: budget.amount.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
      }),
      amountSpent: budget.amountSpent,
      startDate: budget.startDate,
      endDate: budget.endDate,
      category: budget.category
        ? { id: budget.category.id, name: budget.category.name }
        : null,
      earning: budget.earning
        ? { id: budget.earning.id, name: budget.earning.name }
        : null,
      user: budget.user ? { id: budget.user.id, name: budget.user.name } : null,
    };

    return {
      status: 200,
      data: formattedBudget,
      message: 'Budget retrieved successfully!',
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyLowBudget(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    for (const budget of budgets) {
      if (budget.amountSpent && budget.amount) {
        const spentPercentage = (budget.amountSpent / budget.amount) * 100;
        if (spentPercentage >= 90) {
          await this.notificationService.sendNotification(
            budget.user.id,
            'Low Budget Alert',
            `Your budget "${budget.name}" is ${spentPercentage.toFixed(
              2,
            )}% spent.`,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyBudgetDeadline(): Promise<void> {
    const today = new Date();
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    for (const budget of budgets) {
      if (budget.endDate) {
        const endDate = new Date(budget.endDate);
        const daysLeft = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
        );

        if (daysLeft === 1) {
          await this.notificationService.sendNotification(
            budget.user.id,
            'Budget Deadline Alert',
            `Your budget "${budget.name}" ends tomorrow.`,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async notifyNewMonthlyBudgets(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    for (const budget of budgets) {
      if (budget.startDate) {
        const startDate = new Date(budget.startDate);
        const today = new Date();

        if (
          startDate.getMonth() === today.getMonth() &&
          startDate.getFullYear() === today.getFullYear()
        ) {
          await this.notificationService.sendNotification(
            budget.user.id,
            'New Monthly Budget',
            `Your budget "${budget.name}" has been added for this month.`,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyBudgetOverrun(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    for (const budget of budgets) {
      if (budget.amountSpent > budget.amount) {
        await this.notificationService.sendNotification(
          budget.user.id,
          'Overrun Alert',
          `You have overspent on your budget "${budget.name}". Please review your expenses.`,
        );
      }
    }
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
