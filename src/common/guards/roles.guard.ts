import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene @Roles → permitir
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.rol) {
      throw new ForbiddenException('No tienes permisos');
    }

    const hasRole = requiredRoles.includes(user.rol.nombre);

    if (!hasRole) {
      throw new ForbiddenException('Rol no autorizado');
    }

    return true;
  }
}
