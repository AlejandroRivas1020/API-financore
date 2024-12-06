import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
    file?: Express.Multer.File,
    isTest: boolean = false, //** true para probar en swagger false para movil <-----------------------------------------
  ): Promise<{ message: string }> {
    const { name, email, password, phone } = registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    let profilePictureUrl: string | null = null;

    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      if (result?.secure_url) {
        profilePictureUrl = result.secure_url;
      } else {
        throw new Error('Error: secure_url not found in Cloudinary response');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      profilePicture: profilePictureUrl,
    });
    await this.userRepository.save(user);

    const deviceType = isTest ? 6 : 2; // 6 para pruebas en navegador, 2 para Android
    await this.registerUserInOneSignal(user.id, email, deviceType);

    return { message: 'User registered successfully' };
  }

  async registerUserInOneSignal(
    userId: string,
    email: string,
    deviceType: number, // Tipo de dispositivo: 2 (Android) o 6 (Web para pruebas)
  ): Promise<void> {
    const data = {
      app_id: process.env.ONESIGNAL_APP_ID,
      external_user_id: userId,
      identifier: email,
      device_type: deviceType,
    };

    try {
      const response = await axios.post(
        'https://onesignal.com/api/v1/players',
        data,
        {
          headers: {
            Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('User registered in OneSignal:', response.data);
    } catch (error) {
      console.error(
        'Error registering user in OneSignal:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to register user in OneSignal');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async sendRecoveryCode(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('There is no user with this email.');
    }

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.recoveryCode = recoveryCode;
    user.recoveryCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.save(user);

    await this.notificationsService.sendEmail({
      to: email,
      subject: 'Password Recovery Code',
      text: `Your recovery code is: ${recoveryCode}. This code will expire in 15 minutes.`,
    });
  }

  async validateRecoveryCode(email: string, code: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.recoveryCode !== code) {
      throw new UnauthorizedException('Invalid recovery code.');
    }

    if (user.recoveryCodeExpires < new Date()) {
      throw new BadRequestException('The recovery code has expired.');
    }
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.recoveryCode !== code) {
      throw new UnauthorizedException('Invalid recovery code.');
    }

    if (user.recoveryCodeExpires < new Date()) {
      throw new BadRequestException('The recovery code has expired.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.recoveryCode = null;
    user.recoveryCodeExpires = null;

    await this.userRepository.save(user);
  }
}
