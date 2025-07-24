import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const authUser = request.user;

    // Comparação sempre por string, para máxima compatibilidade
    return (
      authUser?.role === 'ADMIN' ||
      requiredRoles.includes(authUser?.role ?? '')
    );
  }
}
