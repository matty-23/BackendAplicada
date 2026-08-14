import { Usuario } from "../models/Usuario";
import { RespuestaPaginada } from "./IFiltrosUsuario";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';

export interface IUsuarioRepository {
    obtenerUsuarios(filtros?:GetUsuariosQueryDTO): Promise<RespuestaPaginada<Usuario>>;
    obtenerUsuarioPorId(id: string): Promise<Usuario | null>;
    obtenerUsuarioPorCorreo(correo: string): Promise<Usuario | null>;
    verificarCorreos(correo: string): Promise<Boolean>;
    crearUsuario(usuario: Usuario): Promise<Usuario>;
    actualizarUsuario(id: string, usuario: PartialUsuario): Promise<Usuario | null>;
    reemplazarUsuario(id: string, usuario: Usuario): Promise<Usuario | null>;
    eliminarUsuario(id: string): Promise<boolean>;
    obtenerUsuariosPorIds(ids: string[]): Promise<Usuario[]>;
    asociarRol(rol: number): Promise<IRol>;
}


export interface PartialUsuario {
    nombre?: string;
    apellido?: string;
    correo?: string;
    contrasena?: string;
    departamento?: string;
    rol?: number;
}