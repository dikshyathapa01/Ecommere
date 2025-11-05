import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY ='roles';
export const Roles=(...roles:string[])=>SetMetadata(ROLES_KEY,roles);
//for eg, we pass 'admin','user' as roles to the Roles decorator as @Roles('admin','user')
//the it will set the metadata with the key 'roles' and value ['admin','user'] for that route handler as similar to the objext below 
//{
//Roles:['admin','user']
//}