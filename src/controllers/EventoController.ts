import { IEventoService } from '../interfaces/IEventoService.js';
import { Controller, Get, Param, NotFoundException, Post, Query, Body, BadRequestException, HttpCode, Put, Delete, Inject, UseGuards, Patch } from '@nestjs/common';
import { EventoDto, CrearEventoDto, EncargadoDto } from '../DTO/EventoDto';
import { Evento } from '../models/Evento.js';
import { EstadoEvento } from '../models/Evento.js';
import { AuthGuard } from "../guards/auth.guard";
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';

@Controller('api/Eventos')
//@UseGuards(AuthGuard)
export class EventoController {

    constructor(@Inject('IEventoService') private readonly _eventoService: IEventoService) { }

    // Fix 4: 'filtros' DEBE ir antes de ':id' para que NestJS no lo capture como parámetro
    @Get('filtros')
    async busquedaBlanda(@Query() filtros: filtrosEventoDto): Promise<EventoDto[]> {
        const eventos = await this._eventoService.filtrado(filtros);
        return eventos.map(c => ({
            id: c.getId(),
            nombre: c.getNombre(),
            fechaInicio: c.getFechaInicio(),
            fechaFinalizacion: c.getFechaFinalizacion(),
            encargado: c.getEncargado(),
            participantes: c.getParticipantes(),
            lugar: c.getLugar(),
            categoria: c.getCategoria(), // Fix 3: devuelve la categoría real
            cantidadPersonas: c.getCantidadPersonas()
        } as EventoDto));
    }

    @Get(':page/all')
    async getAll(@Param('page') page: number): Promise<EventoDto[]> {
        const Eventos = await this._eventoService.getEventos(page);

        return Eventos.map(c => ({
            id: c.getId(),
            nombre: c.getNombre(),
            fechaInicio: c.getFechaInicio(),
            fechaFinalizacion: c.getFechaFinalizacion(),
            encargado: c.getEncargado(),
            participantes: c.getParticipantes(),
            lugar: c.getLugar(),
            categoria: c.getCategoria(), // Fix 3: devuelve la categoría real
            cantidadPersonas: c.getCantidadPersonas()
        } as EventoDto));
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<EventoDto> {
        const evento = await this._eventoService.getEventoById(id);

        if (!evento) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado.`);
        }

        const EventoDto: EventoDto = {
            id: evento.getId(),
            nombre: evento.getNombre(),
            fechaInicio: evento.getFechaInicio(),
            fechaFinalizacion: evento.getFechaFinalizacion(),
            encargado: evento.getEncargado(),
            participantes: [],
            lugar: evento.getLugar(),
            categoria: evento.getCategoria(),
            cantidadPersonas: evento.getCantidadPersonas()
        };

        return EventoDto;
    }

    @Post()
    @HttpCode(201)
    async registrar(@Body() crearEventoDto: CrearEventoDto): Promise<CrearEventoDto> {
        const categoria = crearEventoDto.categoria ?? 'sin_categoria';

        const evento = new Evento(
            'recien_creado-'.concat(crearEventoDto.nombre, Date.now().toString()),
            crearEventoDto.nombre,
            crearEventoDto.fechaInicio,
            crearEventoDto.fechaFinalizacion,
            crearEventoDto.cantidadPersonas,
            crearEventoDto.lugar,
            EstadoEvento.Listo, // Mejora 1: usa el enum en lugar de 'recien_creado'
            categoria
        );
        const eventoRes = await this._eventoService.addEvento(evento);
        if (!eventoRes) {
            throw new BadRequestException("Error al registrar el Evento.");
        }
        const EventoDto: CrearEventoDto = {
            id: eventoRes.getId(),
            nombre: eventoRes.getNombre(),
            fechaInicio: eventoRes.getFechaInicio(),
            fechaFinalizacion: eventoRes.getFechaFinalizacion(),
            lugar: eventoRes.getLugar(),
            categoria: eventoRes.getCategoria(),
            cantidadPersonas: eventoRes.getCantidadPersonas()
        };
        return EventoDto;
    }

    @Put(':id')
    async actualizar(@Param('id') id: string, @Body() even: EventoDto): Promise<void> {
        const categoria = even.categoria ?? 'sin_categoria';

        const evento = new Evento(
            id,
            even.nombre,
            even.fechaInicio,
            even.fechaFinalizacion,
            even.cantidadPersonas,
            even.lugar,
            EstadoEvento.Activo, // Mejora 1: usa el enum en lugar de 'active'
            categoria
        );
        if (even.participantes) evento.setParticipantes(even.participantes);
        if (even.encargado) evento.setEncargado(even.encargado);
        const actualizado = await this._eventoService.updateDetallesEvento(evento);
        if (!actualizado) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado para actualizar.`);
        }
    }

    @Patch(':id/encargado')
    async cambiarEncargado(@Param('id') id: string, @Body() dto: EncargadoDto): Promise<EventoDto> {
        const eventoRes = await this._eventoService.cambiarEncargado(id, dto.usuarioId);
        if (!eventoRes) throw new NotFoundException(`Evento con ID ${id} no encontrado.`);

        return {
            id: eventoRes.getId(),
            nombre: eventoRes.getNombre(),
            fechaInicio: eventoRes.getFechaInicio(),
            fechaFinalizacion: eventoRes.getFechaFinalizacion(),
            encargado: eventoRes.getEncargado(),
            participantes: eventoRes.getParticipantes(),
            lugar: eventoRes.getLugar(),
            categoria: eventoRes.getCategoria(),
            cantidadPersonas: eventoRes.getCantidadPersonas()
        };
    }

    // Fix 2: lógica corregida — retorna null SOLO si la operación falló
    @Patch(':id/AParticipantes')
    async agregarParticipantes(@Param('id') id: string, @Body() participantes: Array<string>) {
        const eventoRes = await this._eventoService.agregarParticipantes(id, participantes);
        if (!eventoRes) return null; // Fix 2: era "if (eventoRes!)" — lógica estaba invertida

        return {
            id: eventoRes.getId(),
            nombre: eventoRes.getNombre(),
            fechaInicio: eventoRes.getFechaInicio(),
            fechaFinalizacion: eventoRes.getFechaFinalizacion(),
            encargado: eventoRes.getEncargado(),
            participantes: eventoRes.getParticipantes(),
            lugar: eventoRes.getLugar(),
            categoria: eventoRes.getCategoria(),
            cantidadPersonas: eventoRes.getCantidadPersonas()
        };
    }

    // Fix 5: se agrega DELETE /:id para aceptar un solo ID por URL (contrato REST estándar que usa el BFF)
    @Delete(':id')
    async eliminarUno(@Param('id') id: string): Promise<void> {
        const eliminado = await this._eventoService.deleteEventos([id]);
        if (!eliminado) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado para eliminar.`);
        }
    }

    // Se mantiene el DELETE bulk original para uso interno / futuro
    @Delete()
    async eliminar(@Body() ids: string[]): Promise<void> {
        const eliminado = await this._eventoService.deleteEventos(ids);
        if (!eliminado) {
            throw new NotFoundException(`Eventos no encontrados para eliminar.`);
        }
    }

    @Patch(':id/BParticipantes')
    async borrarParticipantes(@Param('id') id: string, @Body() participante: EncargadoDto): Promise<EventoDto> {

        const eventoRes = await this._eventoService.borrarParticipante(id, participante.usuarioId);

        if (!eventoRes) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado.`);
        }

        return {
            id: eventoRes.getId(),
            nombre: eventoRes.getNombre(),
            fechaInicio: eventoRes.getFechaInicio(),
            fechaFinalizacion: eventoRes.getFechaFinalizacion(),
            encargado: eventoRes.getEncargado(),
            participantes: eventoRes.getParticipantes(),
            lugar: eventoRes.getLugar(),
            categoria: eventoRes.getCategoria(),
            cantidadPersonas: eventoRes.getCantidadPersonas()
        };
    }

    // Mejora 2: expone el método getEventosporUsuario que ya existía en el service
    @Get('usuario/:id')
    async getByUsuario(@Param('id') id: string): Promise<EventoDto[]> {
        const eventos = await this._eventoService.getEventosporUsuario(id);
        return eventos.map(c => ({
            id: c.getId(),
            nombre: c.getNombre(),
            fechaInicio: c.getFechaInicio(),
            fechaFinalizacion: c.getFechaFinalizacion(),
            encargado: c.getEncargado(),
            participantes: c.getParticipantes(),
            lugar: c.getLugar(),
            categoria: c.getCategoria(),
            cantidadPersonas: c.getCantidadPersonas()
        } as EventoDto));
    }
}