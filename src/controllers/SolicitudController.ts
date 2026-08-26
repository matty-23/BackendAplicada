import { Controller, Get, Param, NotFoundException, Post, Query, Body, HttpCode, Put, Delete, Inject, UseGuards, Patch, Req } from '@nestjs/common';
import { type ISolicitudService } from '../interfaces/ISolicitudService';
import { Solicitud } from '../models/Solicitud';
import { AuthGuard, UsuarioAutenticado } from '../guards/auth.guard';
import { RequierePermiso } from '../decorators/permisos.decorator';
import { Permiso } from '../models/roles/Permisos';
import { CrearSolicitudDto, ModificarSolicitudDto, AceptarSolicitudDto, FiltrosSolicitudDto, RechazarSolicitudDto } from '../DTO/SolicitudDto';

@Controller('api/solicitudes')
@UseGuards(AuthGuard)
export class SolicitudController {
    constructor(@Inject('ISolicitudService') private readonly _solicitudService: ISolicitudService) {}

    private async mapearSolicitudADto(solicitud: Solicitud): Promise<any> {
        const bloques = await solicitud.getBloques();
        return {
            id: solicitud.getId(),
            idUsuarioSolicitante: solicitud.getIdUsuarioSolicitante(),
            tipoEvento: solicitud.getTipoEvento(),
            estado: solicitud.getEstado(),
            cantidadPersonas: solicitud.getCantidadPersonas(),
            personaEncargada: solicitud.getPersonaEncargada(),
            necesidadOperario: solicitud.getNecesidadOperario(),
            autorizacionRectoria: solicitud.getAutorizacionRectoria(),
            tiempoAnticipacion: solicitud.getTiempoAnticipacion(),
            cantidadOperariosDesignados: solicitud.getCantidadOperariosDesignados(),
            bloques: bloques.map(b => ({
                id: b.getId(),
                fechaInicio: b.getFechaInicio(),
                fechaFinalizacion: b.getFechaFinalizacion(),
                lugar: b.getLugar()
            }))
        };
    }

    @Get('mis')
    @RequierePermiso(Permiso.GENERAR_SOLICITUDES)
    async listarMisSolicitudes(@Req() req: { user: UsuarioAutenticado }, @Query('page') page?: number) {
        const solicitudes = await this._solicitudService.listarPorUsuario(req.user.id, page ? Number(page) : 1);
        return Promise.all(solicitudes.map(s => this.mapearSolicitudADto(s)));
    }

    @Get('filtros')
    @RequierePermiso(Permiso.LISTAR_SOLICITUDES)
    async listar(
        @Query() filtros: FiltrosSolicitudDto,
        @Query('page') page?: number
    ){
        const solicitudes = await this._solicitudService.listar(
            filtros, 
            page ? Number(page) : 1
        );
        return Promise.all(solicitudes.map(s => this.mapearSolicitudADto(s)));
    }

    @Get(':id')
    @RequierePermiso(Permiso.LISTAR_SOLICITUDES)
    async obtenerPorId(@Param('id') id: string) {
        const solicitud = await this._solicitudService.obtenerPorId(id);
        if (!solicitud) {
            throw new NotFoundException(`Solicitud con ID ${id} no encontrada.`);
        }
        return await this.mapearSolicitudADto(solicitud);
    }

    @Post()
    @HttpCode(201)
    @RequierePermiso(Permiso.GENERAR_SOLICITUDES)
    async crear(@Req() req: { user: UsuarioAutenticado }, @Body() dto: CrearSolicitudDto) {
        const solicitudCreada = await this._solicitudService.crear(req.user.id, dto);
        return await this.mapearSolicitudADto(solicitudCreada);
    }

    @Put(':id')
    @RequierePermiso(Permiso.MODIFICAR_SOLICITUD)
    async modificar(@Param('id') id: string, @Req() req: { user: UsuarioAutenticado }, @Body() dto: ModificarSolicitudDto) {
        const ok = await this._solicitudService.modificar(id, req.user.id, dto);
        return { message: 'Solicitud actualizada correctamente', ok };
    }

    @Delete(':id')
    @RequierePermiso(Permiso.CANCELAR_SOLICITUDES)
    async cancelar(@Param('id') id: string, @Req() req: { user: UsuarioAutenticado }) {
        const ok = await this._solicitudService.cancelar(id, req.user.id);
        return { message: 'Solicitud cancelada correctamente', ok };
    }

    @Patch(':id/aceptar')
    @RequierePermiso(Permiso.ACEPTAR_SOLICITUD)
    async aceptar(@Param('id') id: string, @Body() dto: AceptarSolicitudDto) {
        const ok = await this._solicitudService.aceptar(id, dto);
        return { message: 'Solicitud aceptada y evento generado correctamente', ok };
    }

    @Patch(':id/rechazar')
    @RequierePermiso(Permiso.RECHAZAR_SOLICITUD)
    async rechazar(@Param('id') id: string, @Body() dto?: RechazarSolicitudDto) {
        const ok = await this._solicitudService.rechazar(id, dto);
        return { message: 'Solicitud rechazada correctamente', ok };
    }
}
