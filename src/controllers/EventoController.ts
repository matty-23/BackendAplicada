import { IEventoService } from '../interfaces/IEventoService.js';
import { Controller, Get, Param, NotFoundException, Post, Query, Body, BadRequestException,ParseIntPipe, HttpCode, Put, Delete, Inject, UseGuards, Patch } from '@nestjs/common';
import { CrearEventoMonoDTO, CrearEventoMultiDTO, EncargadoDto } from '../DTO/EventoDto';
import { Evento } from '../models/Evento.js';
import { Ocurrencia } from '../models/Ocurrencia.js';
import { AuthGuard } from "../guards/auth.guard";
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { ActualizarEventoDTO } from '../DTO/EventoDto';
@Controller('api/Eventos')
@UseGuards(AuthGuard)
export class EventoController {

    constructor(@Inject('IEventoService') private readonly _eventoService: IEventoService) { }

    // ============================================================================
    // MÉTODOS PRIVADOS PARA MAPEO DE DOMINIO A DTO (Evita repetir código)
    // ============================================================================

    private async mapearEventoADto(evento: Evento): Promise<any> {
        // Resolvemos el Lazy Loading de las ocurrencias
        const ocurrencias = await evento.getOcurrencias();

        const ocurrenciasDto = await Promise.all(ocurrencias.map(async (oc) => {
            // Resolvemos el Lazy Loading de los participantes para esta ocurrencia
            const participantes = await oc.getParticipantes();
            
            return {
                id: oc.getId(),
                fechaInicio: oc.getFechaInicio(),
                fechaFinalizacion: oc.getFechaFinalizacion(),
                lugar: oc.getLugar(),
                cantidadPersonas: oc.getCantidadPersonas(),
                encargado: oc.getEncargado(),
                participantes: participantes
            };
        }));

        return {
            id: evento.getId(),
            titulo: evento.getNombre(), // O getTitulo() dependiendo de cómo lo llamaste en el modelo
            estado: evento.getEstado(),
            categoria: evento.getCategoria(),
            ocurrencias: ocurrenciasDto
        };
    }

    // ============================================================================
    // ENDPOINTS GET
    // ============================================================================

    @Get(':page/all')
    async getAll(@Param('page', ParseIntPipe) page: number) {
        const eventos = await this._eventoService.getEventos(page);
        return Promise.all(
            eventos.map(e => this.mapearEventoADto(e))
        );
    }
    @Get('filtros')
    async busquedaBlanda(@Query() filtros: filtrosEventoDto) {
        const eventos = await this._eventoService.filtrado(filtros);

        return await Promise.all(eventos.map(async (e) => {
            const ocurrencias = await e.getOcurrencias();
            return {
                id: e.getId(),
                titulo: e.getNombre(),
                estado: e.getEstado(),
                categoria: e.getCategoria(),
                ocurrencias: ocurrencias.map(oc => ({
                    id: oc.getId(),
                    fechaInicio: oc.getFechaInicio(),
                    fechaFinalizacion: oc.getFechaFinalizacion(),
                    lugar: oc.getLugar(),
                    cantidadPersonas: oc.getCantidadPersonas()
                }))
            };
        }));
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const evento = await this._eventoService.getEventoById(id);

        if (!evento) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado.`);
        }

        return await this.mapearEventoADto(evento);
    }

    // ============================================================================
    // ENDPOINTS DE CREACIÓN Y ACTUALIZACIÓN MACRO
    // ============================================================================



    // POST /api/eventos/multi
    @Post('multi')
    @HttpCode(201)
    async registrarMulti(@Body() dto: CrearEventoMultiDTO) {
        const categoria = dto.categoria || 'sin_categoria';
        // Se mapea el listado de ocurrencias
        const ocurrenciasModelo = dto.ocurrencias.map(oc =>
            new Ocurrencia(
                '0',
                '0',
                new Date(oc.fechaInicio),
                new Date(oc.fechaFinalizacion),
                oc.lugar,
                oc.cantidadPersonas
            )
        );

        // Se instancia el evento con el array de múltiples ocurrencias
        const evento = new Evento('0', dto.titulo, 'pendiente', categoria, ocurrenciasModelo);

        // Ambos llaman a addEvento
        const eventoRes = await this._eventoService.addEvento(evento);
        if (!eventoRes) throw new BadRequestException("Error al registrar el Evento Multi-día.");

        return await this.mapearEventoADto(eventoRes);
    }
    @Put(':id')
    async actualizar(@Param('id') id: string, @Body() dto: ActualizarEventoDTO) {
        await this._eventoService.updateDetallesEvento(id, dto);
        return { message: 'Evento actualizado correctamente' };
    }

    @Delete()
    async eliminar(@Body() ids: string[]): Promise<void> {
        const eliminado = await this._eventoService.deleteEventos(ids);
        if (!eliminado) {
            throw new NotFoundException(`Eventos no encontrados o no se pudieron eliminar.`);
        }
    }


    // ENDPOINTS DE OCURRENCIAS (Encargados y Participantes)
    @Patch(':idEvento/ocurrencias/:idOcurrencia/encargado')
    async cambiarEncargado(
        @Param('idEvento') idEvento: string,
        @Param('idOcurrencia') idOcurrencia: string,
        @Body() dto: EncargadoDto
    ) {
        const actualizado = await this._eventoService.cambiarEncargado(
            idEvento,
            idOcurrencia,
            dto.usuarioId
        );

        if (!actualizado) throw new NotFoundException(`No se pudo actualizar el encargado.`);

        // Devolvemos el evento actualizado
        const eventoRefrescado = await this._eventoService.getEventoById(idEvento);
        return await this.mapearEventoADto(eventoRefrescado!);
    }

    @Patch('ocurrencias/:idOcurrencia/AParticipantes')
    async agregarParticipantes(
        @Param('idOcurrencia') idOcurrencia: string,
        @Body() participantes: string[]
    ) {
        const resultado = await this._eventoService.agregarParticipantes(idOcurrencia, participantes);

        return {
            mensaje: "Participantes procesados",
            advertencia: resultado.advertencia
        };
    }

    @Patch('ocurrencias/:idOcurrencia/BParticipantes')
    async borrarParticipantes(
        @Param('idOcurrencia') idOcurrencia: string,
        @Body() participante: EncargadoDto
    ) {
        const borrado = await this._eventoService.borrarParticipante(
            idOcurrencia,
            participante.usuarioId
        );

        if (!borrado) {
            throw new NotFoundException(`No se pudo eliminar al participante de la ocurrencia ${idOcurrencia}.`);
        }

        return { ok: true, mensaje: "Participante removido" };
    }
}