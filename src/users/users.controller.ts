import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './auth/auth.guard';
import {LoggedInUser, type RequestWithUser} from './decorators/user.decorator';
import { CustomBody } from './decorators/custom-body.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from './auth/roles.guard';
import { Auth } from './decorators/auth.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Get()
 //if we only use @Auth() decorator,it will use AuthGuard by default but do not use RolesGuard
 //if we pass roles as parameter to @Auth() decorator, it will use both AuthGuard and RolesGuard
  @Auth(UserRole.USER)
  @Auth(UserRole.ADMIN)
  findAll(@Req() req:RequestWithUser) {
    const user=req.user;
    console.log(user);
    return this.usersService.findAll();
  }
  

  @Get(':id')
   @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard,RolesGuard)
  findOne(@LoggedInUser('email') user,@Param('id')id:string) {
    console.log('Logged in user',user)
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @Post('/login')
  login(
    @CustomBody('email')email:string,
    @CustomBody('password')password:string,
  ):Promise<{token :string}>{
    return this.usersService.login(email,password);
  }

}
//body ko kaam garne decorator same as body
//TODO:Assignment:Implement @CustomBody() decorator mimicing the functionality of @Body() decorator
//And use it in the new post method below
//Read more about custom decorator here:https://docs.nestjs.com
//you can refer to the implementation of  of @loggedInUser[]
//also refer to the official docs link above to understand how to extract body from object