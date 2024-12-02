import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ResponseCategoryDto } from './dto/create-category.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: ResponseCategoryDto,
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
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseCategoryDto> {
    return this.categoriesService.create(createCategoryDto);
  }
}
