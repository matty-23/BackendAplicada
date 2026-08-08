import { Evento } from "src/models/Evento";

export abstract class IEventoRepository {
    abstract getAllEventos(): Promise<Evento[]>;
    abstract getActiveEventos(): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateEvento(evento: Evento): Promise<boolean>;
    abstract deleteEvento(id: string): Promise<boolean>;
}