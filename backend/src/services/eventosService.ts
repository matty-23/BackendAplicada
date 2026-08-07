import { IEventoService } from '../interfaces/IEventoService.js';
import { IEventoRepository } from '../interfaces/IEventoRepository.js';
import { Evento } from '../models/Evento.js';
import { EventoDto, CrearEventoDto } from '../dtos/EventoDto.js';
import { Inject } from '@nestjs/common';

export class EventosService implements IEventoService {

    constructor(@Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository) {}

    async getEventos(): Promise<Evento[]> {
        return await this.eventoRepository.getAllEventos();
    }

    async getEventoById(id: string): Promise<Evento> {
        return await this.eventoRepository.getEventoById(id);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        return await this.eventoRepository.addEvento(evento);
    }

    async updateEvento(evento: Evento): Promise<boolean> {
        return await this.eventoRepository.updateEvento(evento);
    }

    async deleteEvento(id: string): Promise<boolean> {
        return await this.eventoRepository.deleteEvento(id);
    }
}
