import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete, Query, Res, Req, } from '@nestjs/common';
import { type IUsuarioService } from "../interfaces/IUsuarioService";
import { CrearUsuarioDTO, ActualizarUsuarioDTO, ActualizarUsuarioCompletoDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import { AuthGuard, UsuarioAutenticado } from "../guards/auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { RequierePermiso } from "../decorators/permisos.decorator";
import { Permiso } from "../models/roles/Permisos";
import { ForbiddenException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('/api')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsuarioController {

    constructor(@Inject('IUsuarioService') private readonly usuarioService: IUsuarioService) { }

    // @Post('/register')
    // @RequierePermiso(Permiso.AÑADIR_USUARIO)
    // async createUsuario(@Body() CrearUsuarioDTO: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO> {

    //     return await this.usuarioService.crearUsuario(CrearUsuarioDTO);
    // }

    @Get('/usuarios')
    @RequierePermiso(Permiso.LISTAR_USUARIOS)
    async getUsuarios(@Query() filtros: GetUsuariosQueryDTO, @Res({ passthrough: true }) response: FastifyReply): Promise<ObtenerUsuarioDTO[]> {
        const resultado = await this.usuarioService.obtenerUsuarios(filtros);
        //Mandamos la informacion en la metadata
        response.headers({'X-Total-Count': String(resultado.meta.total),
            'X-Has-Next-Page': String(resultado.meta.hasMore),
            'X-Skip': String(resultado.meta.skip),
            'X-Limit': String(resultado.meta.limit),});

        return resultado.data;
    }

    @Get('/usuario/:id')
    @RequierePermiso(Permiso.LISTAR_USUARIOS)
    async getUsuario(@Param('id') id: string): Promise<ObtenerUsuarioDTO> {
        return await this.usuarioService.obtenerUsuarioPorId(id);
    }

    @Get('/usuario/correo/:correo')
    @RequierePermiso(Permiso.LISTAR_USUARIOS)
    async getUsuarioCorreo(@Param('correo') correo: string): Promise<ObtenerUsuarioDTO | boolean> {
        return await this.usuarioService.obtenerUsuarioPorCorreo(correo);  
  }

    @Patch('/usuario/:id')
    // OJO: esto es un OR a nivel de "¿tiene esta capacidad en general?".
    // PermissionsGuard NO sabe si :id es el usuario que hace el pedido -> eso lo
    // resolvemos abajo, a mano, comparando contra request.user.
    @RequierePermiso(Permiso.MODIFICAR_USUARIO, Permiso.MODIFICAR_USUARIO_PROPIO)
    async updateUsuario(
        @Param('id') id: string,
        @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO,
        @Req() request: FastifyRequest & { user?: UsuarioAutenticado },
    ): Promise<ObtenerUsuarioDTO> {
        const solicitante = request.user!;
        const puedeModificarCualquiera = solicitante.rol.tienePermiso(Permiso.MODIFICAR_USUARIO);
        const esSuPropioUsuario = solicitante.id === id;

        if (!puedeModificarCualquiera && !esSuPropioUsuario) {
            throw new ForbiddenException('Solo podés modificar tu propio usuario');
        }

        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        if (ActualizarUsuarioDTO.contraseña) {
            throw new ForbiddenException('No se puede eliminar un administrador');
        }
        return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);

    }
    @Patch('/usuario/:id/password')
    @RequierePermiso(Permiso.MODIFICAR_USUARIO, Permiso.MODIFICAR_USUARIO_PROPIO)
    async updateUsuarioPassword(
        @Param('id') id: string,
        @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO,
        @Req() request: FastifyRequest & { user?: UsuarioAutenticado },
    ): Promise<ObtenerUsuarioDTO> {
        const solicitante = request.user!;
        const puedeModificarCualquiera = solicitante.rol.tienePermiso(Permiso.MODIFICAR_USUARIO);
        const esSuPropioUsuario = solicitante.id === id;

        if (!puedeModificarCualquiera && !esSuPropioUsuario) {
            throw new ForbiddenException('Solo podés cambiar tu propia contraseña');
        }

        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        //Dejamos que se verifique si el usuario existe y que si no el service lance el error
        return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);
    }

    @Put('/usuario/:id')
    @RequierePermiso(Permiso.MODIFICAR_USUARIO)
    async replaceUsuario(@Param('id') id: string, @Body() ActualizarUsuarioCompletoDTO: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO> {
        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        //Mismo caso que funcion anterior
        return await this.usuarioService.reemplazarUsuario(id, ActualizarUsuarioCompletoDTO);

    }

    @Delete('/usuario/:id')
    @RequierePermiso(Permiso.ELIMINAR_USUARIO)
    async deleteUsuario(@Param('id') id: string): Promise<Boolean> {
        const usuarioEliminado = await this.usuarioService.eliminarUsuario(id);

        return usuarioEliminado;
    }
}