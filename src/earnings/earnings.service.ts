import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEarningDto } from './dto/create-earning.dto';
import { Earning } from './entities/earning.entity';
import { User } from '../users/entities/user.entity';
import { ResponseEarningDto } from './dto/create-earning.response.dto';

@Injectable()
export class EarningsService {
  constructor(
    @InjectRepository(Earning)
    private readonly earningRepository: Repository<Earning>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async getAllEarnings() {
    const earnings = await this.earningRepository.find();
    return {
      status: 200,
      data: earnings,
      message: '¡Earnings found successfully!',
    };
  }
}
