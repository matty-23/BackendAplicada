import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";


export interface IUsuarioService{
    obtenerUsuarios(): Promise<ObtenerUsuarioDTO[]>;
    obtenerUsuarioPorId(id:string): Promise<ObtenerUsuarioDTO>;
    obtenerUsuarioPorCorreo(correo:string):Promise<ObtenerUsuarioDTO>;
    crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO>;
    actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO>;
    reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO>;
    eliminarUsuario(id: string): Promise<boolean>;
}