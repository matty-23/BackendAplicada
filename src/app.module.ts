import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/UsuarioModule';
import { EventoModule } from './modules/EventoModule';
import { Correo } from './models/Correo';
import { CorreoModule } from './modules/CorreoModule';

@Module({
  imports: [
    UsuarioModule, 
    EventoModule,
    CorreoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}