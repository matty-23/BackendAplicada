import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException,Inject,  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';
import { Permiso } from '../models/roles/Permisos';
import { UsuarioAutenticado } from './auth.guard';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permisosRequeridos = this.reflector.get<Permiso[]>(
      PERMISOS_KEY,
      context.getHandler(),
    );

    // Si el endpoint no tiene @RequierePermiso(...), alcanza con estar autenticado.
    // (AuthGuard, que corre antes, ya se encargó de eso)
    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: UsuarioAutenticado }>();
    const user = request.user;

    // Esto no debería pasar si AuthGuard corre antes, pero nos cubrimos igual
    if (!user) {
      throw new UnauthorizedException('No tienes una sesión activa');
    }

    const tienePermiso = permisosRequeridos.some((permiso) =>
      user.rol.tienePermiso(permiso),
    );

    if (!tienePermiso) {
      throw new ForbiddenException('No tenés permiso para realizar esta acción');
    }

    return true;
  }
}