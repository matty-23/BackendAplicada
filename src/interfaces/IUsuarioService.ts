import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";


export interface IUsuarioService{
    obtenerUsuarios(): Promise<ObtenerUsuarioDTO[]>;
    obtenerUsuarioPorId(id:string): Promise<ObtenerUsuarioDTO | boolean>;
    crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO>;
    actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO | boolean>;
    reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO | boolean>;
    eliminarUsuario(id: string): Promise<boolean>;
}