import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete,HttpCode, HttpStatus} from '@nestjs/common';
import { type IUsuarioService } from "../interfaces/IUsuarioService";
import { CrearUsuarioDTO, ActualizarUsuarioDTO, ActualizarUsuarioCompletoDTO, ObtenerUsuarioDTO } from "../DTO/UsuarioDTO";
import {AuthGuard} from "../guards/auth.guard";

@Controller('/api')
@UseGuards(AuthGuard)
export class UsuarioController{

    constructor(@Inject ('IUsuarioService') private readonly usuarioService: IUsuarioService) {}

       @Post('/register')
        async createUsuario(@Body() CrearUsuarioDTO: CrearUsuarioDTO):Promise<ObtenerUsuarioDTO>{

            return await this.usuarioService.crearUsuario(CrearUsuarioDTO);
        }

    @Get('/usuarios')
    async getUsuarios(): Promise<ObtenerUsuarioDTO[]> {
        return await this.usuarioService.obtenerUsuarios();
    }

    @Get('/usuario/:id')
    async getUsuario(@Param('id') id: string): Promise<ObtenerUsuarioDTO | boolean> {
        return await this.usuarioService.obtenerUsuarioPorId(id);   
    }

    @Get('/usuario/correo/:correo')
    async getUsuarioCorreo(@Param('correo') correo: string): Promise<ObtenerUsuarioDTO | boolean> {
        return await this.usuarioService.obtenerUsuarioPorCorreo(correo);   
    }

    @Patch('/usuario/:id')
    async updateUsuario(@Param('id') id: string, @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO | boolean> {
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente || ActualizarUsuarioDTO.contraseña) {
                return false;
            }
            return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);
           
    }
    @Patch('/usuario/:id/password')
    async updateUsuarioPassword(@Param('id') id: string, @Body() ActualizarUsuarioDTO: ActualizarUsuarioDTO): Promise<ObtenerUsuarioDTO | boolean> {
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente) {
                return false;
            }
            return await this.usuarioService.actualizarUsuario(id, ActualizarUsuarioDTO);
    }

    @Put('/usuario/:id')
    async replaceUsuario(@Param('id') id: string, @Body() ActualizarUsuarioCompletoDTO: ActualizarUsuarioCompletoDTO): Promise<ObtenerUsuarioDTO | boolean> {
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente) {
                return false;
            }
            return await this.usuarioService.reemplazarUsuario(id, ActualizarUsuarioCompletoDTO);
            
    }

    @Delete('/usuario/:id')
    async deleteUsuario(@Param('id') id: string) {
            const usuarioEliminado = await this.usuarioService.eliminarUsuario(id);
            if (!usuarioEliminado) {
                return false;
            }
            return usuarioEliminado;
    }
}

