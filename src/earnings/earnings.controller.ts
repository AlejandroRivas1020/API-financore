import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth, // Agregamos la respuesta para error 404
} from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { ResponseEarningDto } from './dto/create-earning.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Earnings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new earning' })
  @ApiResponse({
    status: 201,
    description: 'Earning created successfully',
    type: ResponseEarningDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (e.g., "name" is required)',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User with ID not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID user-id-1234 not found',
        error: 'Not Found',
      },
    },
  })
  async create(
    @Body() createEarningDto: CreateEarningDto,
    @Request() request: any,
  ): Promise<ResponseEarningDto> {
    const userId = request.user.userId;
    console.log(`el user id en el controller es: ${userId}`);
    return this.earningsService.create(createEarningDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all earnings' })
  async getAllEarnings() {
    return this.earningsService.getAllEarnings();
  }
}
