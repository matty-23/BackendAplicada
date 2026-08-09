import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from '../config/auth.config';
import { FastifyRequest } from 'fastify';
import { fromNodeHeaders } from "better-auth/node";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: any }>();
    

    const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
});

    if (!session) {
      throw new UnauthorizedException('No tienes una sesión activa');
    }

    // Inyectamos el usuario en la request para que tus Controllers puedan usarlo
    request['user'] = session.user;
    return true;
  }
}