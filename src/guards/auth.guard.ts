import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { auth } from '../config/auth.config';
import { FastifyRequest } from 'fastify';
import { fromNodeHeaders } from "better-auth/node";
import { type IUsuarioRepository } from '../interfaces/IUsuarioRepository';
import { IRol } from '../interfaces/IRol';

// Lo que queda disponible en request.user para el resto de la app (Controllers, PermissionsGuard, etc.)
export interface UsuarioAutenticado {
  id: string;
  correo: string;
  nombre: string;
  rol: IRol; // instancia real (Administrador, Externo, etc.) -> tiene .tienePermiso()
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: UsuarioAutenticado }>();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new UnauthorizedException('No tienes una sesión activa');
    }

    // session.user es el usuario de BETTER AUTH (id, email, name, emailVerified, image).
    // El rol vive en TU tabla `usuarios` (dominio), que es una tabla aparte.
    // Las unimos por correo, que es el único campo que comparten ambas.
    const usuarioDominio = await this.usuarioRepository.obtenerUsuarioPorCorreo(session.user.email);

    if (!usuarioDominio) {
      throw new UnauthorizedException('Tu cuenta no está registrada en el sistema');
    }

    // Inyectamos el usuario (con su rol) en la request para que Controllers y Guards lo usen
    request.user = {
      id: usuarioDominio.getId(),
      correo: usuarioDominio.getCorreo(),
      nombre: usuarioDominio.getNombreCompleto(),
      rol: usuarioDominio.rol,
    };

    return true;
  }
}