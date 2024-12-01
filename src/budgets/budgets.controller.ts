import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBadgetDto } from './dto/create-badget.dto';
import { ResponseBudgetDto } from './dto/create-badget.response.dto';
import { ResponseBudgetAllDto } from './dto/getAll.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
    @Request() request: any,
  ): Promise<ResponseBudgetDto> {
    const userId = request.user.userId;
    return this.budgetsService.create(createBadgetDto, userId);
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
}
