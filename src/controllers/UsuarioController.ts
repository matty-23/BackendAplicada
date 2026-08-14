import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete, Query, Res, } from '@nestjs/common';
import { type IUsuarioService } from "../interfaces/IUsuarioService";
import { CrearUsuarioDTO, ActualizarUsuarioDTO, ActualizarUsuarioCompletoDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import { AuthGuard } from "../guards/auth.guard";
import { ForbiddenException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Controller('/api')
@UseGuards(AuthGuard)
export class UsuarioController {

    constructor(@Inject('IUsuarioService') private readonly usuarioService: IUsuarioService) { }

    @Post('/register')
    async createUsuario(@Body() CrearUsuarioDTO: CrearUsuarioDTO): Promise<ObtenerUsuarioDTO> {

        return await this.usuarioService.crearUsuario(CrearUsuarioDTO);
    }

    @Get('/usuarios')
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
    async getUsuario(@Param('id') id: string): Promise<ObtenerUsuarioDTO> {
        return await this.usuarioService.obtenerUsuarioPorId(id);
    }

    @Get('/usuario/correo/:correo')
    async getUsuarioCorreo(@Param('correo') correo: string): Promise<ObtenerUsuarioDTO> {
        return await this.usuarioService.obtenerUsuarioPorCorreo(correo);
    }

    @Patch('/usuario/:id')
    async updateUsuario(@Param('id') id: string, @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO> {
        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        if (ActualizarUsuarioDTO.contraseña) {
            throw new ForbiddenException('No se puede eliminar un administrador');
        }
        return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);

    }
    @Patch('/usuario/:id/password')
    async updateUsuarioPassword(@Param('id') id: string, @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO> {
        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        //Dejamos que se verifique si el usuario existe y que si no el service lance el error
        return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);
    }

    @Put('/usuario/:id')
    async replaceUsuario(@Param('id') id: string, @Body() ActualizarUsuarioCompletoDTO: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO> {
        const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
        //Mismo caso que funcion anterior
        return await this.usuarioService.reemplazarUsuario(id, ActualizarUsuarioCompletoDTO);

    }

    @Delete('/usuario/:id')
    async deleteUsuario(@Param('id') id: string): Promise<Boolean> {
        const usuarioEliminado = await this.usuarioService.eliminarUsuario(id);

        return usuarioEliminado;
    }
}

