import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import {RespuestaPaginada} from "../interfaces/IFiltrosUsuario";
export interface IUsuarioService{
    obtenerUsuarios(filtros?:GetUsuariosQueryDTO): Promise<RespuestaPaginada<ObtenerUsuarioDTO>>;
    obtenerUsuarioPorId(id:string): Promise<ObtenerUsuarioDTO>;
    obtenerUsuarioPorCorreo(correo:string):Promise<ObtenerUsuarioDTO>;
    //crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO>;
    actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO>;
    reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO>;
    eliminarUsuario(id: string): Promise<boolean>;
}
