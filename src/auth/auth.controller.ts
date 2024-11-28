import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateRegisterWithFileDto } from './dto/register-user-with-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new contact with a profile picture (optional)',
    type: CreateRegisterWithFileDto,
    required: true,
  })
  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async register(
    @Body() registerUserDto: CreateRegisterWithFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ message: string }> {
    return await this.authService.register(registerUserDto, file);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: LoginUserDto, description: 'User login data' })
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.login(loginUserDto);
  }
}
