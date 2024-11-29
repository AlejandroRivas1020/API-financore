import { Controller, Post, Body, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse, // Agregamos la respuesta para error 404
} from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { ResponseEarningDto } from './dto/create-earning.response.dto';

@ApiTags('Earnings')
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
  ): Promise<ResponseEarningDto> {
    return this.earningsService.create(createEarningDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all earnings' })
  async getAllEarnings() {
    return this.earningsService.getAllEarnings();
  }
}
