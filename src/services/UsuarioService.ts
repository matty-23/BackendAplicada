import { IUsuarioService } from "../interfaces/IUsuarioService";
import { ActualizarUsuarioCompletoDTO, ActualizarUsuarioDTO, CrearUsuarioDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { type IUsuarioRepository, PartialUsuario } from "../interfaces/IUsuarioRepository";
import { ConflictException, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Usuario } from "../models/Usuario";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import { RespuestaPaginada } from "../interfaces/IFiltrosUsuario";
import { Injectable, Inject } from "@nestjs/common";
import { IRol } from "../interfaces/IRol";
import { Administrador } from "../models/roles/Administrador";
import { Externo } from "../models/roles/Externo";
import { Visitante } from "../models/roles/Visitante";
import { Becario } from "../models/roles/Becario";
import { Empleado } from "../models/roles/Empleado";
import { Voluntario } from "../models/roles/Voluntario";

@Injectable()
export class UsuarioService implements IUsuarioService {

    constructor(@Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository) { }

    async obtenerUsuarios(filtros?: GetUsuariosQueryDTO): Promise<RespuestaPaginada<ObtenerUsuarioDTO>> {
        const usuarios = await this.usuarioRepository.obtenerUsuarios(filtros);
        //Solo hacemos la conversion de usuarios a su dto
        const data = usuarios.data.map((usuario) => ({
            id: usuario.getId(),
            nombre: usuario.getNombre(),
            apellido: usuario.getApellido(),
            correo: usuario.getCorreo(),
            departamento: usuario.getDepartamento(),
            rol: usuario.rol.getRol(),
        }));

        return { data, meta: usuarios.meta, };
    }

    async obtenerUsuarioPorId(id: string): Promise<ObtenerUsuarioDTO> {
        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(id);
        if (!usuario) throw new NotFoundException(`Usuario con ID: ${id} no encontrado.`);
        return { id: usuario.getId(), nombre: usuario.getNombre(), apellido: usuario.getApellido(), correo: usuario.getCorreo(), departamento: usuario.getDepartamento(), rol: usuario.rol.getRol() };
    }

    async obtenerUsuarioPorCorreo(correo: string): Promise<ObtenerUsuarioDTO> {
        const usuario = await this.usuarioRepository.obtenerUsuarioPorCorreo(correo);
        if (!usuario) throw new NotFoundException(`Usuario con ${correo} no encontrado.`);
        return { id: usuario.getId(), nombre: usuario.getNombre(), apellido: usuario.getApellido(), correo: usuario.getCorreo(), departamento: usuario.getDepartamento(), rol: usuario.rol.getRol() };
    }

    // async crearUsuario(usuario: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO> {

    //     if (!usuario.rol) usuario.rol = 'invitado';
    //     const rol = await this.asignarRol(usuario.rol);

    //     const usuarioExiste = await this.usuarioRepository.verificarCorreos(usuario.correo);
    //     if (usuarioExiste) throw new ConflictException('El usuario con correo $ {usuario.correo} ya existe');

    //     //const saltRounds = 11;
    //     //const contraseñaHasheada = await bcrypt.hash(usuario.contraseña, saltRounds);

    //     const usuarioRecibido = new Usuario("0", usuario.nombre, usuario.apellido, usuario.correo, usuario.contraseña, usuario.departamento, rol);
    //     const nuevoUsuario = await this.usuarioRepository.crearUsuario(usuarioRecibido);

    //     return { id: nuevoUsuario.getId(), nombre: nuevoUsuario.getNombre(), apellido: nuevoUsuario.getApellido(), correo: nuevoUsuario.getCorreo(), departamento: nuevoUsuario.getDepartamento(), rol: nuevoUsuario.rol.getRol() };
    // }

    async actualizarUsuario(id: string, usuario: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO> {
        const usuarioExistente: PartialUsuario = {};

        usuarioExistente.nombre = usuario.nombre;
        usuarioExistente.apellido = usuario.apellido;
        usuarioExistente.correo = usuario.correo;
        usuarioExistente.departamento = usuario.departamento;
        if (usuario.rol) {
            usuarioExistente.rol = await this.asociarRolInverso((await this.asignarRol(usuario.rol)));
        }

        const usuarioActualizado = await this.usuarioRepository.actualizarUsuario(id, usuarioExistente);
        if (!usuarioActualizado) throw new InternalServerErrorException('El usuario no pudo actualizarse');

        return { id: usuarioActualizado.getId(), nombre: usuarioActualizado.getNombre(), apellido: usuarioActualizado.getApellido(), correo: usuarioActualizado.getCorreo(), departamento: usuarioActualizado.getDepartamento(), rol: usuarioActualizado.rol.getRol() };
    }

    async reemplazarUsuario(id: string, usuario: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO> {
        //Recordar que se actualiza todo excepto contraseña, para eso se usa la actualizacion parcial
        const usuarioExistente = new Usuario(id, usuario.nombre, usuario.apellido, usuario.correo, "", usuario.departamento, await this.asignarRol(usuario.rol));
        if (!await this.usuarioRepository.verificarCorreos(usuarioExistente.getCorreo())) throw new NotFoundException("El usuario ${usuarioExistente.getCorreo()} no existe");
        const usuarioReemplazado = await this.usuarioRepository.reemplazarUsuario(id, usuarioExistente);
        if (!usuarioReemplazado) throw new InternalServerErrorException('El usuario no pudo actualizarse');
        return { id: usuarioReemplazado.getId(), nombre: usuarioReemplazado.getNombre(), apellido: usuarioReemplazado.getApellido(), correo: usuarioReemplazado.getCorreo(), departamento: usuarioReemplazado.getDepartamento(), rol: usuarioReemplazado.rol.getRol() };
    }
    async eliminarUsuario(id: string): Promise<boolean> {
        //Revisar despues si no hay que añadir alguna validacion extra
        const usuarioExistente = await this.usuarioRepository.obtenerUsuarioPorId(id);
        if (!usuarioExistente) throw new NotFoundException(`Usuario con ID: ${id} no encontrado.`);
        if (usuarioExistente.rol.getRol() === 'administrador') throw new ForbiddenException('No se puede eliminar un administrador');
        return await this.usuarioRepository.eliminarUsuario(id);
    }
    private async asignarRol(rol: string): Promise<IRol> {
        switch (rol) {
            case 'administrador':
                return new Administrador();
            case 'externo':
                return new Externo();
            case 'invitado':
                return new Visitante();
            case 'becario':
                return new Becario();
            case 'empleado':
                return new Empleado();
            case 'voluntario':
                return new Voluntario();
            default:
                throw new Error(`Rol no válido: ${rol}`);
        }
    }
    private async asociarRolInverso(rol: IRol): Promise<number> {
        switch (rol.getRol()) {
            case 'invitado':
                return 1;
            case 'administrador':
                return 2;
            case 'externo':
                return 3;
            case 'becario':
                return 4;
            case 'empleado':
                return 5;
            case 'voluntario':
                return 6;
            default:
                return 1;
        }
    }
}