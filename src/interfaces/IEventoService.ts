import {Evento} from '../models/Evento.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
export abstract class IEventoService {
    abstract getEventos(page:number): Promise<Evento[]>;
    abstract getEventosActive(page: number): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento | null>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateDetallesEvento(evento: Evento): Promise<boolean>;
    abstract deleteEventos(id: string[]): Promise<boolean>
    abstract agregarParticipantes(id: string, participantes : string[]): Promise<Evento|null>;
    abstract cambiarEncargado(idEvento:string, idEncargado:string): Promise<Evento | null>
    abstract borrarParticipante(idEvento: string, participantes: string): Promise<Evento | null>;
    abstract filtrado(filtros: filtrosEventoDto): Promise<Evento[]>;
}

