import {Evento} from '../models/Evento.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { ActualizarEventoDTO } from '../DTO/EventoDto.js';
import { CrearEventoMultiDTO } from '../DTO/EventoDto.js';
export abstract class IEventoService {
    abstract getEventos(page:number): Promise<Evento[]>;
    abstract getEventoById(id: string): Promise<Evento | null>;
    abstract crearEventoMulti(dto: CrearEventoMultiDTO): Promise<Evento> ;
    abstract updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean>
    abstract deleteEventos(id: string[]): Promise<boolean>
    abstract agregarParticipantes(idOcurrencia: string, participantes: string[]): Promise<{ advertencia?: string }>;
    abstract cambiarEncargado(idEvento: string, idOcurrencia: string, idEncargado: string): Promise<boolean> 
    abstract borrarParticipante(idOcurrencia: string, idUsuario: string): Promise<boolean>;
    abstract filtrado(filtros: filtrosEventoDto): Promise<Evento[]>;
}

