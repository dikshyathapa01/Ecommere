import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    //TODO:Similar to AuthMiddleware from express ,get user info from database and attach to request
    //as of now we are just attaching the payload 
    const user=await this.usersService.findOne(payload.sub);
    request['user'] = user;
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(type, token)
    return type == 'Bearer' ? token : undefined;
  }
}
