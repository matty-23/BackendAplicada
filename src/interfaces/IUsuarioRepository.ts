import { Usuario } from "../models/Usuario";

export interface IUsuarioRepository {
    obtenerUsuarios(): Promise<Usuario[]>;
    obtenerUsuarioPorId(id: string): Promise<Usuario | null>;
    crearUsuario(usuario: Usuario): Promise<Usuario>;
    actualizarUsuario(id: string, usuario: Partial<Usuario>): Promise<Usuario | null>;
    reemplazarUsuario(id: string, usuario: Usuario): Promise<Usuario | null>;
    eliminarUsuario(id: string): Promise<boolean>;
}
