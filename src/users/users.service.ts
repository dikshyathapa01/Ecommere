import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
  try {
    // 1️⃣ Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // 3️⃣ Remove password from response
    const { password, ...result } = savedUser;

    return result;

  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    console.log(error);
    throw new InternalServerErrorException('Error creating user');
  }
}

  //  Find All Users
  async findAll(): Promise<User[]> {

    return this.userRepository.find();
  }

  // Find One User
  //use this method in authguard to get user info from database
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  //  Update User
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    Object.assign(user, updateUserDto);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error updating user');
    }
  }

  //  Delete User
  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  // async login(email: string, password: string) {
  //   const user = await this.userRepository.findOne({
  //     where: { email: email },
  //     select:{
  //       id:true,
  //       email:true,
  //       password:true,
  //       role:true
  //     }
  //   });
  //   if (!user) {
  //     throw new UnauthorizedException('Invalid Credentials');
  //   }
  //   if (user.password !== password) {
  //     throw new UnauthorizedException('Invalid Credentials');
  //   }
  //   const token = await this.jwtService.signAsync({
  //     id: user.id,
  //     email: user.email,
  //     role: user.role
  //   });
  //   return { token, role: user.role };
  // }
  
    async login(email: string, password: string): Promise<{ token: string; role: string }> {
    // Find the user and select password explicitly
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token, role: user.role };
  }
}
