import { Module } from '@nestjs/common';
import { EventoController } from '../controllers/EventoController';
import { EventoService } from '../services/EventoService';
import { EventoRepository } from '../repository/EventoRepository';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { ParticipanteRepository } from '../repository/ParticipanteRepository';

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
      provide: 'IParticipantes',
      useClass: ParticipanteRepository,
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
