import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {Request} from 'express'
import { User } from "../entities/user.entity";
export interface RequestWithUser extends Request{
    //TODO: We need to update this type once we attach more info of user from database in authguard
    user:Omit<User,'password'>;
}
export const LoggedInUser=createParamDecorator(
   (data:keyof RequestWithUser['user'],context: ExecutionContext)=>{

    const request=context.switchToHttp().getRequest<RequestWithUser>();
    const user= request.user;
    return data? user[data]:user;
   }
)