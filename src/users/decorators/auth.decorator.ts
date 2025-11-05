import { applyDecorators, UseGuards } from "@nestjs/common";
import { Roles } from "./roles.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";

export function Auth (...roles:string[]){
    return applyDecorators(Roles(...roles),UseGuards(AuthGuard,RolesGuard))
}