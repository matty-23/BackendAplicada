import { Module } from '@nestjs/common';
import { EventoController } from '../controllers/EventoController';
import { EventoService } from '../services/EventoService';
import { EventoRepository } from '../repository/EventoRepository';
import { Evento_UsuarioRepository } from '../repository/Evento_UsuarioRepository';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@Module({
  controllers: [
    EventoController,
  ],

  providers: [
    PrismaService,

    {
      provide: 'IEventoService',
      useClass: EventoService,
    },

    {
      provide: 'IEventoRepository',
      useClass: EventoRepository,
    },

    {
      provide: 'IEvento_UsuarioRepository',
      useClass: Evento_UsuarioRepository,
    },

    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },

    AuthGuard,
    PermissionsGuard,
  ],

  exports: [
    'IEventoService',
  ],
})
export class EventoModule {}
