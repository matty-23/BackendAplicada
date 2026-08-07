import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Usuario, Prisma } from '@prisma/client';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  // Inyectamos la instancia única de Prisma
  constructor(private prisma: PrismaService) {}

  async obtenerPorId(id: string): Promise<Usuario | null> {
    return this.prisma.onModuleInit().then(() => {
      return this.prisma.usuario.findUnique({
        where: { id },
      });
    });
  }

  async crear(datos: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.onModuleInit().then(() => {
      return this.prisma.usuario.create({
        data: datos,
      });
    });
  }
}