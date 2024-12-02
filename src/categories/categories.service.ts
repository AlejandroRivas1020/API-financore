import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { ResponseCategoryDto } from './dto/create-category.response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<ResponseCategoryDto> {
    const { name } = createCategoryDto;

    // Crear nueva categoría
    const category = this.categoryRepository.create({ name });

    try {
      const savedCategory = await this.categoryRepository.save(category);
      return {
        status: 201,
        data: {
          id: savedCategory.id,
          name: savedCategory.name,
        },
        message: 'Category successfully created',
      };
    } catch (error) {
      throw new Error(`Error saving category: ${error.message}`);
    }
  }
}
