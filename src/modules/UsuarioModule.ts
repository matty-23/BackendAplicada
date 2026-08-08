import { Module } from '@nestjs/common';
import { UsuarioController } from '../controllers/UsuarioController';
import { UsuarioService } from '../services/UsuarioService';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  controllers: [UsuarioController],
  providers: [
    PrismaService,
    UsuarioRepository,
    // Proveedor para la interfaz del repositorio
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
    UsuarioService,
    // Proveedor para la interfaz del servicio que pide el Controller
    {
      provide: 'IUsuarioService',
      useClass: UsuarioService,
    },
  ],
  exports: ['IUsuarioService', UsuarioService],
})
export class UsuarioModule {}