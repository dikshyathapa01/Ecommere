import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './auth/auth.guard';
import {
  LoggedInUser,
  type RequestWithUser,
} from './decorators/user.decorator';
import { CustomBody } from './decorators/custom-body.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from './auth/roles.guard';
import { Auth } from './decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  @UseInterceptors(FileInterceptor('profile'))
  register(
    @UploadedFile() _file: Express.Multer.File,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Get()
  @Auth(UserRole.USER)
  @Auth(UserRole.ADMIN)
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    console.log(user);
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  findOne(@LoggedInUser('email') user, @Param('id') id: string) {
    console.log('Logged in user', user);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('/login')
  login(
    @CustomBody('email') email: string,
    @CustomBody('password') password: string,
  ): Promise<{ token: string; role: string }> {
    return this.usersService.login(email, password);
  }
}
