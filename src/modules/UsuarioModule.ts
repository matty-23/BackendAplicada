import { Module } from '@nestjs/common';
import { UsuarioController } from '../controllers/UsuarioController';
import { UsuarioService } from '../services/UsuarioService';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@Module({
  controllers: [UsuarioController],
  providers: [
    PrismaService,
    UsuarioRepository,
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
    UsuarioService,
    {
      provide: 'IUsuarioService',
      useClass: UsuarioService,
    },
    AuthGuard,
    PermissionsGuard,
  ],
  exports: ['IUsuarioService', UsuarioService],
})
export class UsuarioModule {}

