import { Evento } from "../models/Evento";
import { filtrosEventoDto } from "../DTO/FiltrosDto";
export abstract class IEventoRepository {
    abstract getAllEventos(page:number): Promise<Evento[]>;
    abstract getActiveEventos(page:number): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento |null>;
    abstract addEvento(evento: Evento): Promise<Evento>;
    abstract updateEvento(evento: Evento): Promise<boolean>;
    abstract deleteEventos(ids: string[]): Promise<boolean>;
    abstract traerEventosPorIDs(ids: string[]): Promise<Evento[]> ;
    abstract filtrado( filtros:filtrosEventoDto ): Promise<Evento[]>
}