import { IEventoService } from '../interfaces/IEventoService.js';
import { Controller, Get, Param, NotFoundException, Post, Body, BadRequestException, HttpCode, Put, Delete, Inject, UseGuards } from '@nestjs/common';
import { EventoDto, CrearEventoDto } from '../dtos/EventoDto.js';
import { Evento } from '../models/evento.js';

@Controller('api/Eventos')
export class EventosController {

    constructor(@Inject('IEventoService') private readonly _eventoService: IEventoService) { }

    @Get()
    async getAll(): Promise<EventoDto[]> {
        const Eventos = await this._eventoService.getEventos();

        const EventosDto = Eventos.map(c => ({
            id: c.getId(),
            nombre: c.getNombre(),
            fechaInicio: c.getFechaInicio(),
            fechaFinalizacion: c.getFechaFinalizacion(),
            encargado: c.getEncargado(),
            participantes: c.getParticipantes(), 
            lugar: c.getLugar(),
            categoria: '1',
            cantidadPersonas: c.getCantidadPersonas()
        } as EventoDto));

        return EventosDto;
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
            encargado: [],
            participantes: [], //preguntar si pasamos solo nombre o usuario completo
            lugar: evento.getLugar(),
            categoria: evento.getCategoria(),
            cantidadPersonas: evento.getCantidadPersonas()
        };

        return EventoDto;
    }

    @Post()
    @HttpCode(201)
    async registrar(@Body() crearEventoDto: CrearEventoDto): Promise<CrearEventoDto> {
         var categoria : string;
        if (crearEventoDto.categoria == undefined){
            categoria = 'sin_categoria'
        } else {
            categoria = crearEventoDto.categoria
        }
        const evento = new Evento(
            'recien_creado -'.concat(crearEventoDto.nombre, Date.now().toString() ), // o generar el id en el service
            crearEventoDto.nombre,
            crearEventoDto.fechaInicio,
            crearEventoDto.fechaFinalizacion,
            crearEventoDto.cantidadPersonas,
            crearEventoDto.lugar,
            1,
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
            fechaFinalizacion: eventoRes.getFechaFinalizacion(), //preguntar si pasamos solo nombre o usuario completo
            lugar: eventoRes.getLugar(),
            categoria: eventoRes.getCategoria(),
            cantidadPersonas: eventoRes.getCantidadPersonas()
        };
        return EventoDto;
    }

    @Put(':id')
    async actualizar(@Param('id') id: string, @Body() even: EventoDto): Promise<void> {
                 var categoria : string;
        if (even.categoria == undefined){
            categoria = 'sin_categoria'
        } else {
            categoria = even.categoria
        }
        const evento = new Evento(
            id,
            even.nombre,
            even.fechaInicio,
            even.fechaFinalizacion,
            even.cantidadPersonas,
            even.lugar,
            1,
            categoria
        );
        evento.setParticipantes(even.participantes);
        evento.setEncargado(even.encargado);
        const actualizado = await this._eventoService.updateEvento(evento);
        if (!actualizado) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado para actualizar.`);
        }
    }

    @Delete(':id')
    async eliminar(@Param('id') id: string): Promise<void> {
        const eliminado = await this._eventoService.deleteEvento(id);
        if (!eliminado) {
            throw new NotFoundException(`Evento con ID ${id} no encontrado para eliminar.`);
        }
    }

}