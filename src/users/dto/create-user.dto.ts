import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  PhoneNumber?: string;

  @IsString()
  address: string;
  
  @IsOptional()
  @IsString()
  profilePicture?: string;
  
  @IsEnum(UserRole)
  role:UserRole;
}
