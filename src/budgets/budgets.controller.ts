import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { ResponseBudgetAllDto } from './dto/getAll.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { ResponseBudgetDto } from './dto/create-budget.response.dto';
import { ResponseBudgetUpdateDto } from './dto/update-budget.response.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ResponseBudgetDeleteDto } from './dto/delete-budget.dto';

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
    type: CreateBudgetDto,
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
    @Body() createBudgetDtoCreateBudgetDto: CreateBudgetDto,
    @Request() request: any,
  ): Promise<ResponseBudgetDto> {
    const userId = request.user.userId;
    return this.budgetsService.create(createBudgetDtoCreateBudgetDto, userId);
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
  async getAll(@Request() request: any): Promise<ResponseBudgetAllDto> {
    const userId = request.user.userId;
    return this.budgetsService.getAllBudgets(userId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a budget',
    description:
      'Updates an existing budget based on the provided details. Requires ownership of the budget.',
  })
  @ApiBody({
    type: UpdateBudgetDto,
    description: 'The budget details to update the existing budget',
    examples: {
      example1: {
        summary: 'Complete example',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Budget Name',
          description: 'Updated description for the budget',
          amount: 750000,
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          categoryId: 'cdef1234-abcd-5678-ef90-1234567890ab',
          earningId: 'fghi5678-ijkl-1234-mnop-567890abcdef',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The budget has been successfully updated.',
    type: ResponseBudgetUpdateDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget, Category, Earning, or User not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The user is not the owner of the budget.',
  })
  async update(
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Request() request: any,
  ): Promise<ResponseBudgetUpdateDto> {
    const userId = request.user.userId;
    return this.budgetsService.updateBudget(updateBudgetDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a budget',
    description:
      'Removes an existing budget based on the provided ID. Requires ownership of the budget.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The budget has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The user is not the owner of the budget.',
  })
  async delete(
    @Param('id')
    id: string,
    @Request()
    request: any,
  ): Promise<ResponseBudgetDeleteDto> {
    const userId = request.user.userId;
    return this.budgetsService.deleteBudget(id, userId);
  }
}
