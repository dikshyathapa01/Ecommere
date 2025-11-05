import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RequestWithUser } from "../decorators/user.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";
@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}
        canActivate(context:ExecutionContext):boolean | Promise<boolean>{
            const requiredRoles=this.reflector.getAllAndOverride<string[]>(
                ROLES_KEY,
                [context.getHandler(),context.getClass()],

            );
            if(!requiredRoles || requiredRoles.length===0){
                return true; //if no roles are required,allow access
            }
            const request=context.switchToHttp().getRequest<RequestWithUser>();
            const user=request.user;
            if(!user){
                return false; //if there's no user in the request,deny access
            }
            return requiredRoles.includes(user.role);
        }
}