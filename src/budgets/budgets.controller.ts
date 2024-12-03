import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { ResponseBudgetDto } from './dto/create-badget.response.dto';
import { ResponseBudgetAllDto } from './dto/getAll.response.dto';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new budget',
    description:
      'Creates a new budget entry with the provided details, linking it to a category, earning, and user.',
  })
  @ApiBody({
    type: CreateBadgetDto,
    description: 'The budget details to create a new budget',
    examples: {
      example1: {
        summary: 'Complete example',
        value: {
          name: 'Monthly Budget',
          description: 'Budget allocated for November expenses',
          amount: 500000,
          startDate: '2024-11-01',
          endDate: '2024-12-01',
          categoryId: 'cdef1234-abcd-5678-ef90-1234567890ab',
          earningId: 'fghi5678-ijkl-1234-mnop-567890abcdef',
          userId: 'mnop5678-abcd-1234-qrst-567890uvwxyz',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The budget has been successfully created.',
    type: ResponseBudgetDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data. Check the payload.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Related entity (Category, Earning, or User) not found.',
  })
  async create(
    @Body() createBadgetDto: CreateBadgetDto,
  ): Promise<ResponseBudgetDto> {
    return this.budgetsService.create(createBadgetDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all budgets',
    description: 'Retrieves all budgets created by the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of budgets.',
    type: ResponseBudgetAllDto,
  })
  async getAll(): Promise<ResponseBudgetAllDto> {
    return this.budgetsService.getAllBudgets();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get budget by ID',
    description: 'Retrieve a single budget by its ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the requested budget.',
    type: ResponseBudgetDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget not found.',
  })
  async getById(@Param('id') id: string): Promise<ResponseBudgetDto> {
    return this.budgetsService.getById(id);
  }

  @Get('test-notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test budget notifications',
    description: 'Triggers manual notifications for testing purposes.',
  })
  async testNotifications(): Promise<void> {
    await this.budgetsService.notifyLowBudget();
    await this.budgetsService.notifyBudgetDeadline();
    await this.budgetsService.notifyNewMonthlyBudgets();
    await this.budgetsService.notifyBudgetOverrun();
  }
}
