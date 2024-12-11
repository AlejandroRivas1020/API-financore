import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEarningDto } from './dto/create-earning.dto';
import { Earning } from './entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseEarningDto } from './dto/create-earning.response.dto';
import { Budget } from 'src/budgets/entities/budget.entity';
import { ResponseEarningDeleteDto } from './dto/delete-earning.dto';
import { ResponseFindOneEarningDto } from './dto/findOne-earning.dto';

@Injectable()
export class EarningsService {
  constructor(
    @InjectRepository(Earning)
    private readonly earningRepository: Repository<Earning>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  async create(
    createEarningDto: CreateEarningDto,
    userId: string,
  ): Promise<ResponseEarningDto> {
    const { name, startDate, endDate, generalAmount } = createEarningDto;

    console.log(userId);

    const parsedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const parsedEndDate = endDate instanceof Date ? endDate : new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO format (YYYY-MM-DD).',
      );
    }

    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const earning = this.earningRepository.create({
      name,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      generalAmount,
      user,
    });

    try {
      const savedEarning = await this.earningRepository.save(earning);
      return {
        status: 201,
        data: {
          id: savedEarning.id,
          name: savedEarning.name,
          startDate: savedEarning.startDate,
          endDate: savedEarning.endDate,
          generalAmount: savedEarning.generalAmount,
        },
        message: 'Earning successfully created',
      };
    } catch (error) {
      throw new Error(`Error saving earning: ${error.message}`);
    }
  }

  async updateEarningsAmountBudgeted(): Promise<ResponseEarningDto> {
    const budgets = await this.budgetRepository.find({
      relations: ['earning'],
    });

    try {
      let updatedEarning: any = null;

      for (const budget of budgets) {
        const earning = budget.earning;

        if (!earning) {
          continue;
        }

        earning.amountBudgeted += budget.amount;

        if (isNaN(earning.amountBudgeted)) {
          throw new Error(
            `Invalid amountBudgeted for earning with ID ${earning.id}`,
          );
        }

        updatedEarning = await this.earningRepository.save(earning);
      }

      if (!updatedEarning) {
        throw new Error('No earnings were updated.');
      }

      return {
        status: 200,
        message: 'Earning updated successfully',
        data: {
          id: updatedEarning.id,
          name: updatedEarning.name,
          startDate: updatedEarning.startDate,
          endDate: updatedEarning.endDate,
          generalAmount: updatedEarning.generalAmount,
          amountBudgeted: null,
        },
      };
    } catch (error) {
      throw new Error(`Error updating earnings: ${error.message}`);
    }
  }

  async findOneEarning(id: string): Promise<ResponseFindOneEarningDto> {
    const earning = await this.earningRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!earning) {
      throw new NotFoundException(`Earning with ID ${id} not found`);
    }

    return {
      status: 200,
      data: {
        id: earning.id,
        name: earning.name,
        startDate: earning.startDate,
        endDate: earning.endDate,
        generalAmount: earning.generalAmount,
        amountBudgeted: earning.amountBudgeted,
        user: {
          id: earning.user.id,
          name: earning.user.name,
        },
      },
      message: 'Earning found successfully',
    };
  }

  async getAllEarnings(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const earnings = await this.earningRepository.find({ where: { user } });

    const formattedEarnings = earnings.map((earning) => ({
      ...earning,
      amountBudgeted: earning.amountBudgeted.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
      }),
    }));

    return {
      status: 200,
      data: formattedEarnings,
      message: '¡Earnings found successfully!',
    };
  }

  async getEarningsData() {
    return await this.earningRepository.find({
      select: ['id', 'name', 'generalAmount', 'amountBudgeted'],
    });
  }

  async deleteEarning(
    id: string,
    userId: string,
  ): Promise<ResponseEarningDeleteDto> {
    const { data: earning } = await this.findOneEarning(id);

    if (earning.user.id !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this earning',
      );
    }

    await this.earningRepository.delete(id);

    return {
      status: 200,
      message: 'Earning deleted successfully',
    };
  }
}
