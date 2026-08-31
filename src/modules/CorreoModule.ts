import { Module } from '@nestjs/common';
import { CorreoController } from '../controllers/CorreoController';
import { CorreoService } from '../services/CorreoService';
import { CorreoRepository } from '../repository/CorreoRepository';
import { Resend } from 'resend';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { UsuarioModule } from './UsuarioModule';

@Module({
    imports: [
    UsuarioModule,
  ],

  controllers: [CorreoController],
  providers: [
    {
      provide: 'RESEND_CLIENT',
      useFactory: () => {
        return new Resend(process.env.RESEND_API_KEY);
      },
    },
    {
      provide: 'ICorreoRepository',
      useClass: CorreoRepository,
    },
    {
      provide: 'ICorreoService',
      useClass: CorreoService,
    },
    AuthGuard,
    PermissionsGuard,
  ],
  exports: ['ICorreoService'],
})
export class CorreoModule {}

