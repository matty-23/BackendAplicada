import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/UsuarioModule';
import { EventoModule } from './modules/EventoModule';
<<<<<<< HEAD
import { SolicitudModule } from './modules/SolicitudModule';
=======
import { Correo } from './models/Correo';
import { CorreoModule } from './modules/CorreoModule';
>>>>>>> origin/develop

@Module({
  imports: [
    UsuarioModule, 
    EventoModule,
<<<<<<< HEAD
    SolicitudModule
=======
    CorreoModule
>>>>>>> origin/develop
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}