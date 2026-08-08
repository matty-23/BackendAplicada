import { Evento } from "../models/Evento";

export abstract class IEventoRepository {
    abstract getAllEventos(): Promise<Evento[]>;
    abstract getActiveEventos(): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento |null>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateEvento(evento: Evento): Promise<boolean>;
    abstract deleteEvento(id: string): Promise<boolean>;
}