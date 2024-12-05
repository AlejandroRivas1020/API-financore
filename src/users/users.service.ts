import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    let profilePictureUrl: string | null = null;

    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      if (result?.secure_url) {
        profilePictureUrl = result.secure_url;
      } else {
        throw new Error('Error: secure_url not found in Cloudinary response');
      }
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    let profilePictureUrl: string | null = user.profilePicture;

    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      if (result?.secure_url) {
        profilePictureUrl = result.secure_url;

        if (user.profilePicture) {
          await this.cloudinaryService.deleteImage(user.profilePicture);
        }
      } else {
        throw new Error('Error: secure_url not found in Cloudinary response');
      }
    }

    const updatedUser = Object.assign(user, updateUserDto, {
      profilePicture: profilePictureUrl,
    });

    await this.userRepository.save(updatedUser);

    return updatedUser;
  }
}
