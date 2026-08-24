import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete, Query, Res, Req, } from '@nestjs/common';
import { type IUsuarioService } from "../interfaces/IUsuarioService";
import { CrearUsuarioDTO, ActualizarUsuarioDTO, ActualizarUsuarioCompletoDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import { AuthGuard, UsuarioAutenticado } from "../guards/auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { RequierePermiso } from "../decorators/permisos.decorator";
import { Permiso } from "../models/roles/Permisos";
import { ForbiddenException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {ICorreoService} from "../interfaces/ICorreoService";
import { CorreoConfirmacionCuentaDTO, CorreoDTO, CorreoRecuperacionContrasenaDTO } from '../DTO/CorreoDTO';

@Controller('/notificaciones')
@UseGuards(AuthGuard, PermissionsGuard)
export class CorreoController {
    constructor(private correoService: ICorreoService) {}

    @Post('/confirmacion')
    @RequierePermiso(Permiso.LISTAR_USUARIOS,Permiso.RECIBIR_NOTIFICACIONES)
    async enviarCorreoConfirmacionSolicitudAEvento(@Body() correoData: CorreoDTO): Promise<void> {

        const resultado = await this.correoService.enviarCorreo(correoData);
        if (!resultado) throw new ForbiddenException('No se pudo enviar el correo');
        
    }
     
    @Post('/cuenta/confirmacion')
    @RequierePermiso(Permiso.LISTAR_USUARIOS,Permiso.RECIBIR_NOTIFICACIONES)
    async enviarCorreoConfirmacionCuenta(@Body() correoData: CorreoConfirmacionCuentaDTO): Promise<void> {

        const resultado = await this.correoService.enviarCorreoConfirmacionCuenta(correoData);
        if (!resultado) throw new ForbiddenException('No se pudo enviar el correo');
        
    }

    @Post('/recuperacion')
    @RequierePermiso(Permiso.LISTAR_USUARIOS,Permiso.RECIBIR_NOTIFICACIONES)
    async enviarCorreoRecuperacionContrasena(@Body() correoData: CorreoRecuperacionContrasenaDTO): Promise<void> {
        const resultado = await this.correoService.enviarCorreoRecuperacionContrasena(correoData);
        if (!resultado) throw new ForbiddenException('No se pudo enviar el correo');
    }

    @Post()
    @RequierePermiso(Permiso.LISTAR_USUARIOS,Permiso.RECIBIR_NOTIFICACIONES)
    async enviarCorreoNotificaciones(@Body() correoData: CorreoDTO): Promise<void> {
        const resultado = await this.correoService.enviarCorreoNotificaciones(correoData);
        if (!resultado) throw new ForbiddenException('No se pudo enviar el correo');
    }
}