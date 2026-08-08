import {Evento} from '../models/Evento.js';

export abstract class IEventoService {
    abstract getEventos(): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento | null>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateDetallesEvento(evento: Evento): Promise<boolean>;
    abstract deleteEvento(id: string): Promise<boolean>;
    abstract agregarParticipantes(id: string, participantes : string[]): Promise<Evento|null>;
    abstract cambiarEncargado(idEvento:string, idEncargado:string): Promise<Evento | null>
    abstract borrarParticipante(idEvento: string, participantes: string): Promise<Evento | null>;
}

