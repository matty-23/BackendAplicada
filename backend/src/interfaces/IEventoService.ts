import {Evento} from '../models/Evento.js';

export abstract class IEventoService {
    abstract getEventos(): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateEvento(evento: Evento): Promise<boolean>;
    abstract deleteEvento(id: string): Promise<boolean>;
}