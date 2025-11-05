import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {Request} from 'express';
export const CustomBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if(typeof data==='string'){
return (request.body as Record <string,unknown>)?.[data];
    }
    return request.body as unknown;
  },
);
