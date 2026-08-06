import { IUsuarioService} from "../interfaces/IUsuarioService";
import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";

export class UsuarioService implements IUsuarioService{
    async obtenerUsuarios(): Promise<ObtenerUsuarioDTO[]> {
        throw new Error("Method not implemented.");
    }
    async obtenerUsuarioPorId(id: string): Promise<ObtenerUsuarioDTO | boolean> {
        throw new Error("Method not implemented.");
    }
    async crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO> {
        throw new Error("Method not implemented.");
    }
    async actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO | boolean> {
        throw new Error("Method not implemented.");
    }
    async reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO | boolean> {
        throw new Error("Method not implemented.");
    }
    async eliminarUsuario(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}