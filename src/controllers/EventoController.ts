import { IEventoService } from '../interfaces/IEventoService.js';
import { Controller, Get, Param, NotFoundException, Post,Query, Body, BadRequestException, HttpCode, Put, Delete, Inject, UseGuards, Patch } from '@nestjs/common';
import { EventoDto, CrearEventoDto, EncargadoDto } from '../DTO/EventoDto';
import { Evento } from '../models/Evento.js';
import { AuthGuard } from "../guards/auth.guard";
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
@Controller('api/Eventos')
//@UseGuards(AuthGuard)
export class EventoController {

    constructor(@Inject('IEventoService') private readonly _eventoService: IEventoService) { }

    @Get(':page/all')
    async getAll(@Param('page')page:number): Promise<EventoDto[]> {
        const Eventos = await this._eventoService.getEventos(page);

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
            encargado: evento.getEncargado(),
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
        var categoria: string;
        if (crearEventoDto.categoria == undefined) {
            categoria = 'sin_categoria'
        } else {
            categoria = crearEventoDto.categoria
        }
        const evento = new Evento(
            'recien_creado -'.concat(crearEventoDto.nombre, Date.now().toString()), // o generar el id en el service
            crearEventoDto.nombre,
            crearEventoDto.fechaInicio,
            crearEventoDto.fechaFinalizacion,
            crearEventoDto.cantidadPersonas,
            crearEventoDto.lugar,
            'recien_creado',
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
        var categoria: string;
        if (even.categoria == undefined) {
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
            'active',
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
        const eventoRes = await this._eventoService.cambiarEncargado(
            id,
            dto.usuarioId
        );
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

    @Patch(':id/AParticipantes')
    async agregarParticipantes(@Param('id') id: string, @Body() participantes: Array<string>) {
        console.log('ID EVENTO:', id);
        console.log('PARTICIPANTES:', participantes);
        console.log('ES ARRAY:', Array.isArray(participantes));
        const eventoRes = await this._eventoService.agregarParticipantes(id, participantes)
        if (eventoRes!) return null;


        const EventoDto: EventoDto = {
            id: eventoRes!.getId(),
            nombre: eventoRes!.getNombre(),
            fechaInicio: eventoRes!.getFechaInicio(),
            fechaFinalizacion: eventoRes!.getFechaFinalizacion(), //preguntar si pasamos solo nombre o usuario completo
            encargado: eventoRes!.getEncargado(),
            participantes: eventoRes!.getParticipantes(),
            lugar: eventoRes!.getLugar(),
            categoria: eventoRes!.getCategoria(),
            cantidadPersonas: eventoRes!.getCantidadPersonas()
        };
        return EventoDto;
    }

    @Delete()
    async eliminar(@Body() ids: string[]): Promise<void> {
        const eliminado = await this._eventoService.deleteEventos(ids);
        if (!eliminado) {
            throw new NotFoundException(`Evento con ID ${ids} no encontrado para eliminar.`);
        }
    }

    @Patch(':id/BParticipantes')
    async borrarParticipantes(@Param('id') id: string, @Body() participante: EncargadoDto): Promise<EventoDto> {

        const eventoRes = await this._eventoService.borrarParticipante(
            id,
            participante.usuarioId
        );

        if (!eventoRes) {
            throw new NotFoundException(
                `Evento con ID ${id} no encontrado.`
            );
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

    @Get('filtros')
    async busquedaBlanda(@Query() filtros: filtrosEventoDto): Promise<EventoDto[]> {
    const eventos = await this._eventoService.filtrado(filtros);
        const EventosDto = eventos.map(c => ({
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
}