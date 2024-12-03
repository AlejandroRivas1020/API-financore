import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { ResponseCategoryDto } from './dto/create-category.response.dto';
import { User } from 'src/users/entities/user.entity';
import { ResponseCategoriesAllDto } from './dto/getAllCategories.response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<ResponseCategoryDto> {
    const { name } = createCategoryDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const category = this.categoryRepository.create({
      name,
      user,
    });

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

  async getAllCategories(userId: string): Promise<ResponseCategoriesAllDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const categories = await this.categoryRepository.find({ where: { user } });

    return {
      status: 200,
      data: categories,
      message: 'All categories retrieved successfully',
    };
  }
}
