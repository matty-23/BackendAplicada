import { Usuario } from "../models/Usuario";
import { IRol } from "./IRol";

export interface IUsuarioRepository {
    obtenerUsuarios(): Promise<Usuario[]>;
    obtenerUsuarioPorId(id: string): Promise<Usuario | null>;
    obtenerUsuarioPorCorreo(correo:string): Promise<Usuario | null>;
    verificarCorreos(correo:string):Promise<Boolean>;
    crearUsuario(usuario: Usuario): Promise<Usuario>;
    actualizarUsuario(id: string, usuario: PartialUsuario): Promise<Usuario | null>;
    reemplazarUsuario(id: string, usuario: Usuario): Promise<Usuario | null>;
    eliminarUsuario(id: string): Promise<boolean>;
    obtenerUsuariosPorIds(ids: string[]): Promise<Usuario[]>;

}


export interface PartialUsuario{
    nombre?: string;
    apellido?: string;
    correo?: string;
    contrasena?: string;
    departamento?: string;
    rol?: number;
}