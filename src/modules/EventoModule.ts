import { Module } from '@nestjs/common';

import { EventoController } from '../controllers/EventoController';
import { EventoService } from '../services/EventoService';

import { EventoRepository } from '../repository/EventoRepository';
import { ParticipanteRepository } from '../repository/ParticipanteRepository';
import { UsuarioRepository } from '../repository/UsuarioRepository';

import { PrismaService } from '../prisma/PrismaService';
import { IParticipantes } from '../interfaces/IParticipantes';

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
  ],

  exports: [
    'IEventoService',
  ],
})
export class EventoModule {}