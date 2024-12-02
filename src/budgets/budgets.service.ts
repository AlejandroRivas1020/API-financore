import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { Budget } from './entities/budget.entity';
import { Category } from '../categories/entities/category.entity';
import { Earning } from '../earnings/entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseBudgetDto } from './dto/create-badget.response.dto';
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
      console.warn(
        `Warning: Budget amount (${amount}) exceeds available amount (${availableAmount}).`,
      );

      const notificationTitle = 'Budget Exceeded!';
      const notificationMessage = `You have exceeded your available funds. Budget: ${amount}, Available: ${availableAmount}`;
      await this.notificationService.sendNotification(
        user.id,
        notificationTitle,
        notificationMessage,
      );
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

      earning.amountBudgeted = amountBudgeted + amount;

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
            amountBudgeted: earning.amountBudgeted.toLocaleString('en-US', {
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyLowBudget(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    budgets.forEach(async (budget) => {
      const spentPercentage = (budget.amountSpent / budget.amount) * 100;

      if (spentPercentage >= 90) {
        await this.notificationService.sendNotification(
          budget.user.id,
          'Low Budget Alert',
          `Your budget for "${budget.name}" is ${spentPercentage.toFixed(
            2,
          )}% spent.`,
        );
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyBudgetDeadline(): Promise<void> {
    const today = new Date();
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    budgets.forEach(async (budget) => {
      const endDate = new Date(budget.endDate);
      const daysLeft = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
      );

      if (daysLeft === 1) {
        await this.notificationService.sendNotification(
          budget.user.id,
          'Budget Deadline Alert',
          `Your budget for "${budget.name}" ends tomorrow.`,
        );
      }
    });
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async notifyNewMonthlyBudgets(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    budgets.forEach(async (budget) => {
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
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyBudgetOverrun(): Promise<void> {
    const budgets = await this.budgetRepository.find({ relations: ['user'] });

    budgets.forEach(async (budget) => {
      if (budget.amountSpent > budget.amount) {
        await this.notificationService.sendNotification(
          budget.user.id,
          'Overrun Alert',
          `You have overspent on your budget "${budget.name}". Please review your expenses.`,
        );
      }
    });
  }
}
