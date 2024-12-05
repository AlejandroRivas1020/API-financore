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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidateRecoveryTokenDto } from './dto/validate-recovery-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password recovery' })
  @ApiResponse({ status: 200, description: 'Email sent successfully.' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    await this.authService.sendRecoveryCode(email);
    return { message: 'A recovery code has been sent to your email.' };
  }

  @Post('validate-recovery-code')
  @ApiOperation({ summary: 'Validate recovery code' })
  @ApiResponse({ status: 200, description: 'Valid code.' })
  @ApiBody({ type: ValidateRecoveryTokenDto })
  async validateRecoveryCode(
    @Body() validateRecoveryTokenDto: ValidateRecoveryTokenDto,
  ): Promise<{ message: string }> {
    const { token, email } = validateRecoveryTokenDto;
    await this.authService.validateRecoveryCode(email, token);
    return { message: 'Valid recovery code.' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, email, newPassword } = resetPasswordDto;
    await this.authService.resetPassword(email, token, newPassword);
    return { message: 'Password reset successfully.' };
  }
}
