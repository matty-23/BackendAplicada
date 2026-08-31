// src/interfaces/IEventoRepository.ts

import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { filtrosEventoDto } from '../DTO/FiltrosDto';

export interface IEventoRepository {

    getAllEventos(page: number,): Promise<Evento[]>;
    getEventoById(id: string,): Promise<Evento | null>;
    addEvento(evento: Evento,): Promise<Evento>;
    updateEvento(evento: Evento,): Promise<boolean>;
    guardarGoogleEventId(idOcurrencia: string, googleEventId: string): Promise<void>;
    updateOcurrencia(ocurrencia: Ocurrencia,): Promise<boolean>;
    traerEventosPorIDs(ids: string[],): Promise<Evento[]>;
    deleteEventos(ids: string[],): Promise<boolean>;
    filtrado(filtros: filtrosEventoDto,): Promise<Evento[]>;
}