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
<<<<<<< HEAD
  exports: ['IUsuarioService', UsuarioService],
=======
  exports: ['IUsuarioService','IUsuarioRepository',UsuarioService,UsuarioRepository],
>>>>>>> 85fe2de3d5649b89432a632ab3617a60293524d3
})
export class UsuarioModule {}

