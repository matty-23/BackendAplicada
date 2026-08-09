import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/UsuarioModule';
import { EventoModule } from './modules/EventoModule';

@Module({
  imports: [
    UsuarioModule, 
    EventoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}