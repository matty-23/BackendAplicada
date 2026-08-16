import { Evento } from "../models/Evento";
import { Usuario } from "../models/Usuario";

export abstract class IParticipantes {

    abstract agregar(eventoId: string, usuarioId: string): Promise<void>;

    abstract eliminar(eventoId: string, usuarioId: string): Promise<boolean>;
    
    abstract agregarMuchos(eventoId: string,usuarioIds: string[]): Promise<void>;
    
    abstract obtenerEventosDeUnUsuario(IdUsuario: string): Promise<string[]>;
}