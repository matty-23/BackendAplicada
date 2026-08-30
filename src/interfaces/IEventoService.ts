import { Evento } from '../models/Evento.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { ActualizarEventoDTO, ActualizarOcurrenciaDTO } from '../DTO/EventoDto.js';
import { CrearEventoMultiDTO } from '../DTO/EventoDto.js';
export abstract class IEventoService {
    abstract getEventos(page: number): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento | null>;
    abstract crearEventoMulti(dto: CrearEventoMultiDTO): Promise<Evento>;
    abstract updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean>
    abstract deleteEventos(id: string[]): Promise<boolean>
    abstract agregarParticipantes(idOcurrencia: string, participantes: string[]): Promise<{ advertencia?: string }>;
    abstract actualizarOcurrencia(idEvento: string, idOcurrencia: string, dto: ActualizarOcurrenciaDTO): Promise<boolean>;
    abstract filtrado(filtros: filtrosEventoDto): Promise<Evento[]>;
}

