import { IEventoService } from '../interfaces/IEventoService.js';
import { Controller, Get, Param, NotFoundException, Post, Query, Body, BadRequestException, ParseIntPipe, HttpCode, Put, Delete, Inject, UseGuards, Patch } from '@nestjs/common';
import { CrearEventoMultiDTO, ActualizarEventoDTO } from '../DTO/EventoDto';
import { Evento } from '../models/Evento.js';
import { AuthGuard } from "../guards/auth.guard";
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { ActualizarOcurrenciaDTO } from '../DTO/OcurrenciaDto.js';
import { RequierePermiso } from '../decorators/permisos.decorator.js';
import { Permiso } from '../models/roles/Permisos.js';
import { CalendarioService } from '../services/CalendarioService.js';
@Controller('api/Eventos')
@UseGuards(AuthGuard)
export class EventoController {

    constructor(@Inject('IEventoService') private readonly _eventoService: IEventoService,
        private readonly _calendarService: CalendarioService,
    ) { }

    private async mapearEventoADto(evento: Evento): Promise<any> {
        const ocurrencias = await evento.getOcurrencias();

        const ocurrenciasDto = await Promise.all(
            ocurrencias.map(async (oc) => {
                const participantes = await oc.getParticipantes();

                return {
                    id: oc.getId(),
                    fechaInicio: oc.getFechaInicio(),
                    fechaFinalizacion: oc.getFechaFinalizacion(),
                    lugar: oc.getLugar(),
                    cantidadPersonas: oc.getCantidadPersonas(),
                    encargado: oc.getEncargado(),
                    participantes: participantes,
                    tipo: oc.getTipo(),
                    ocurrenciaOriginal: oc.getOcurrenciaOriginal(),
                };
            })
        );

        return {
            id: evento.getId(),
            titulo: evento.getNombre(),
            estado: evento.getEstado(),
            categoria: evento.getCategoria(),
            color: evento.getColor(),
            recurrencia: evento.getRecurrencia(),
            ocurrencias: ocurrenciasDto
        };
    }

    @Get(':page/all')
    @RequierePermiso(Permiso.LISTAR_EVENTOS)
    async getAll(@Param('page', ParseIntPipe) page: number) {
        const eventos = await this._eventoService.getEventos(page);
        return Promise.all(
            eventos.map(e => this.mapearEventoADto(e))
        );
    }

    @Get('filtros')
    @RequierePermiso(Permiso.LISTAR_EVENTOS)
    async busquedaBlanda(@Query() filtros: filtrosEventoDto) {
        const eventos = await this._eventoService.filtrado(filtros);

        return await Promise.all(eventos.map(async (e) => {
            const ocurrencias = await e.getOcurrencias();
            return {
                id: e.getId(),
                titulo: e.getNombre(),
                estado: e.getEstado(),
                categoria: e.getCategoria(),
                color: e.getColor(),
                recurrencia: e.getRecurrencia(),
                ocurrencias: ocurrencias.map(oc => ({
                    id: oc.getId(),
                    tipo: oc.getTipo(),
                    fechaInicio: oc.getFechaInicio(),
                    fechaFinalizacion: oc.getFechaFinalizacion(),
                    lugar: oc.getLugar(),
                    cantidadPersonas: oc.getCantidadPersonas(),
                    ocurrenciaOriginal: oc.getOcurrenciaOriginal()
                }))
            };
        }));
    }

    @Get(':id')
    @RequierePermiso(Permiso.VER_DETALLES_EVENTOS)
    async getById(@Param('id') id: string) {
        const evento = await this._eventoService.getEventoById(id);

        if (!evento) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado.`);
        }

        return await this.mapearEventoADto(evento);
    }

    @Post('multi')
    @HttpCode(201)
    @RequierePermiso(
        Permiso.AÑADIR_EVENTOS,
        Permiso.LISTAR_EVENTOS
    )
    async registrarMulti(@Body() dto: CrearEventoMultiDTO) {
        const eventoRes = await this._eventoService.crearEventoMulti(dto);
        if (!eventoRes) {
            throw new BadRequestException(
                "Error al registrar el Evento Multi-día."
            );
        }

        const respuestaDto = await this.mapearEventoADto(eventoRes);

        return respuestaDto;
    }
    @Put(':id')
    @RequierePermiso(Permiso.MODIFICAR_EVENTOS)
    async actualizar(@Param('id') id: string, @Body() dto: ActualizarEventoDTO) {
        await this._eventoService.updateDetallesEvento(id, dto);
        return { message: 'Evento actualizado correctamente' };
    }

    @Delete()
    @RequierePermiso(Permiso.ELIMINAR_EVENTOS)
    async eliminar(@Body() ids: string[]): Promise<void> {
        const eliminado = await this._eventoService.deleteEventos(ids);
        if (!eliminado) {
            throw new NotFoundException(`Eventos no encontrados o no se pudieron eliminar.`);
        }
    }


    @Patch(':idEvento/ocurrencias/:idOcurrencia')
    @RequierePermiso(Permiso.MODIFICAR_EVENTOS)
    async actualizarOcurrencia(@Param('idEvento') idEvento: string, @Param('idOcurrencia') idOcurrencia: string, @Body() dto: ActualizarOcurrenciaDTO) {
        const actualizado = await this._eventoService.actualizarOcurrencia(
            idEvento,
            idOcurrencia,
            dto
        );

        if (!actualizado) {
            throw new NotFoundException(
                `No se pudo actualizar la ocurrencia.`
            );
        }

        const eventoRefrescado =
            await this._eventoService.getEventoById(idEvento);

        return await this.mapearEventoADto(eventoRefrescado!);
    }

    @Patch('ocurrencias/:idOcurrencia/AParticipantes')
    @RequierePermiso(Permiso.MODIFICAR_EVENTOS)
    async agregarParticipantes(@Param('idOcurrencia') idOcurrencia: string, @Body() participantes: string[]) {
        const resultado = await this._eventoService.agregarParticipantes(idOcurrencia, participantes);

        return {
            mensaje: "Participantes procesados",
            advertencia: resultado.advertencia
        };
    }

}