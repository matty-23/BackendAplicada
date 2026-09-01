import { Module } from '@nestjs/common';
import { EventoController } from '../controllers/EventoController';
import { EventoService } from '../services/EventoService';
import { EventoRepository } from '../repository/EventoRepository';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { PrismaService } from '../prisma/PrismaService';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { ParticipanteRepository } from '../repository/ParticipanteRepository';
<<<<<<< HEAD
import { CalendarioService } from '../services/CalendarioService';
import { ICalendarioService } from '../interfaces/ICalendarioService';
=======

>>>>>>> 85fe2de3d5649b89432a632ab3617a60293524d3
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
<<<<<<< HEAD
    {
      provide: 'ICalendarioService',
      useClass: CalendarioService,
    },
=======

>>>>>>> 85fe2de3d5649b89432a632ab3617a60293524d3
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
<<<<<<< HEAD
export class EventoModule { }
=======
export class EventoModule {}
>>>>>>> 85fe2de3d5649b89432a632ab3617a60293524d3
