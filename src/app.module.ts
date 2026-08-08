import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/UsuarioModule';
import { UsuarioController } from './controllers/UsuarioController';


@Module({
  imports: [UsuarioModule],
  controllers: [],
  providers: [],
})
export class AppModule {}