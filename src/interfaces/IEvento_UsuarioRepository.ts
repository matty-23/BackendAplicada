import { Evento } from "../models/Evento";
import { Usuario } from "../models/Usuario";

export abstract class IEvento_UsuarioRepository {

    abstract obtenerIdsUsuariosPorEvento(eventoId: string): Promise<string[]>;

    abstract obtenerIdsUsuariosPorEventos(eventoIds: string[]): Promise<Map<string, string[]>>;

    abstract agregar(eventoId: string, usuarioId: string): Promise<void>;

    abstract eliminar(eventoId: string, usuarioId: string): Promise<boolean>;
    
    abstract agregarMuchos(eventoId: string,usuarioIds: string[]): Promise<void>;
}