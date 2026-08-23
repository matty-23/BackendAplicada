import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/UsuarioModule';
import { EventoModule } from './modules/EventoModule';
import { SolicitudModule } from './modules/SolicitudModule';

@Module({
  imports: [
    UsuarioModule, 
    EventoModule,
    SolicitudModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}