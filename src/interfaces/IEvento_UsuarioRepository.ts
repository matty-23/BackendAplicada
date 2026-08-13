import { Evento } from "../models/Evento";
import { Usuario } from "../models/Usuario";

export abstract class IEvento_UsuarioRepository {

    abstract agregar(eventoId: string, usuarioId: string): Promise<void>;

    abstract eliminar(eventoId: string, usuarioId: string): Promise<boolean>;
    
    abstract agregarMuchos(eventoId: string,usuarioIds: string[]): Promise<void>;
    
    abstract obtenerEventosDeUnUsuario(IdUsuario: string): Promise<string[]>;
}