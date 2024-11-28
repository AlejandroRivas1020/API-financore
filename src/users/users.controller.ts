import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserWithFileDto } from './dto/create-user-with-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserWithFileDto } from './dto/update-user-with-file.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new contact with a profile picture (optional)',
    type: CreateUserWithFileDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @Body() createUserDto: CreateUserWithFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<User> {
    return await this.usersService.create(createUserDto, file);
  }

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [User] })
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'ID of the user', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'ID of the user', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update a contact with optional fields',
    type: UpdateUserWithFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserWithFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto, file);
  }
}
