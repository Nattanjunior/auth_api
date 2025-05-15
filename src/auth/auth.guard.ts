import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '@prisma/client';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private Jwt: JwtService, private prisma: PrismaService) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const payload = this.Jwt.verify<{
        name: string;
        email: string;
        role: Roles;
        sub: string;
      }>(token, { algorithms: ['HS256'] })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      })

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      request.user = user;

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token', { cause: error })
    }

    return true
  }
}
