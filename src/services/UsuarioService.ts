import { IUsuarioService} from "../interfaces/IUsuarioService";
import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { type IUsuarioRepository, PartialUsuario  } from "../interfaces/IUsuarioRepository";
import { Usuario } from "../models/Usuario";
import { Injectable, Inject } from "@nestjs/common";
import { IRol } from "../interfaces/IRol";
import { Administrador } from "../models/Administrador";
import { Externo } from "../models/Externo";
import { Invitado } from "../models/Invitado";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService implements IUsuarioService{
    
    constructor(@Inject ('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository) {}
    
    async obtenerUsuarios(): Promise<ObtenerUsuarioDTO[]> {
        const usuarios = await this.usuarioRepository.obtenerUsuarios();
        return usuarios.map(usuario => ({ id: usuario.getId(), nombre: usuario.getNombre(), apellido: usuario.getApellido(), correo: usuario.getCorreo(), departamento: usuario.getDepartamento(), rol: usuario.rol.getRol() }));
    }

    async obtenerUsuarioPorId(id: string): Promise<ObtenerUsuarioDTO | boolean> {
        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(id);
        if (!usuario) return false;
        return { id: usuario.getId(), nombre: usuario.getNombre(), apellido: usuario.getApellido(), correo: usuario.getCorreo(), departamento: usuario.getDepartamento(), rol: usuario.rol.getRol() };
    }

    async crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO> {

        if (!usuario.rol) usuario.rol= 'invitado'; 
        const rol = await this.asignarRol(usuario.rol);

        const saltRounds = 11;
        const contraseñaHasheada= await bcrypt.hash(usuario.contraseña, saltRounds);

        const usuarioRecibido = new Usuario("0", usuario.nombre, usuario.apellido, usuario.correo, usuario.contraseña, usuario.departamento, rol); 
        const nuevoUsuario = await this.usuarioRepository.crearUsuario(usuarioRecibido);
        
        return { id: nuevoUsuario.getId(), nombre: nuevoUsuario.getNombre(), apellido: nuevoUsuario.getApellido(), correo: nuevoUsuario.getCorreo(), departamento: nuevoUsuario.getDepartamento(), rol: nuevoUsuario.rol.getRol() };
    }
    
    async actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO | boolean> {
        const usuarioExistente : PartialUsuario = {};

        usuarioExistente.nombre = usuario.nombre;
        usuarioExistente.apellido = usuario.apellido;
        usuarioExistente.correo = usuario.correo;
        usuarioExistente.contrasena = usuario.contraseña;
        usuarioExistente.departamento = usuario.departamento;
        if(usuario.rol){
            const rol = await this.asignarRol(usuario.rol);
            let rolTransformado = await this.asociarRolInverso(rol);
            usuarioExistente.rol = usuario.rol ? rolTransformado : undefined;}

        const usuarioActualizado = await this.usuarioRepository.actualizarUsuario(id, usuarioExistente);
        if (!usuarioActualizado) return false;

        return { id: usuarioActualizado.getId(), nombre: usuarioActualizado.getNombre(), apellido: usuarioActualizado.getApellido(), correo: usuarioActualizado.getCorreo(), departamento: usuarioActualizado.getDepartamento(), rol: usuarioActualizado.rol.getRol() };
    }
    async reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO | boolean> {
        //Recordar que se actualiza todo excepto contraseña, para eso se usa la actualizacion parcial
        const usuarioExistente = new Usuario(id, usuario.nombre, usuario.apellido, usuario.correo, "", usuario.departamento, await this.asignarRol(usuario.rol));
        const usuarioReemplazado = await this.usuarioRepository.reemplazarUsuario(id, usuarioExistente);
        if (!usuarioReemplazado) return false;
        return { id: usuarioReemplazado.getId(), nombre: usuarioReemplazado.getNombre(), apellido: usuarioReemplazado.getApellido(), correo: usuarioReemplazado.getCorreo(), departamento: usuarioReemplazado.getDepartamento(), rol: usuarioReemplazado.rol.getRol() };
    }
    async eliminarUsuario(id: string): Promise<boolean> {
        //Revisar despues si no hay que añadir alguna validacion extra
        const usuarioExistente = await this.usuarioRepository.obtenerUsuarioPorId(id);
        if (!usuarioExistente || usuarioExistente.rol.getRol() === 'administrador') return false;
        return await this.usuarioRepository.eliminarUsuario(id);
    }
    private async asignarRol(rol: string): Promise<IRol> {
        switch (rol) {
            case 'administrador':
                return new Administrador();
            case 'externo':
                return new Externo();
            case 'invitado':
                return new Invitado();
            default:
                throw new Error(`Rol no válido: ${rol}`);
        }
    }
    private async asociarRolInverso(rol: IRol): Promise<number> {
    switch (rol.getRol()) {
        case 'invitado':
          return 1;
        default:
          return 1; }
    }
}