import { Module } from '@nestjs/common';
import { SolicitudController } from '../controllers/SolicitudController';
import { SolicitudService } from '../services/SolicitudService';
import { SolicitudRepository } from '../repository/SolicitudRepository';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { EventoModule } from './EventoModule';

@Module({
  imports: [EventoModule],
  controllers: [
    SolicitudController,
  ],
  providers: [
    PrismaService,
    {
      provide: 'ISolicitudService',
      useClass: SolicitudService,
    },
    {
      provide: 'ISolicitudRepository',
      useClass: SolicitudRepository,
    },
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
    AuthGuard,
    PermissionsGuard,
  ],
  exports: [
    'ISolicitudService',
  ],
})
export class SolicitudModule {}
