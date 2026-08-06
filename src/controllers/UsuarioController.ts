import { Controller, Get, Param, Post, Body, Inject, Patch, Put UseGuards  } from '@nestjs/common';
import { Usuario } from "../models/Usuario";
import { Request, Response } from 'express';
import { IUsuarioService } from "../interfaces/IUsuarioService";


@Controller('/api')
export class UsuarioController{

    constructor(@Inject ('IUsuarioService')private readonly usuarioService: IUsuarioService) {}

    @Get('/usuarios')
    async getUsuarios(req: Request, res: Response): Promise<void> {
        try {
            const usuarios = await this.usuarioService.obtenerUsuarios();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los usuarios', error });
        }
    }

    @Get('/usuario/:id')
    async getUsuario(@Param('id') id: string, res: Response): Promise<void> {
        try {
            const usuario = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuario) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el usuario', error });
        }
    }

    @Post('/usuario')
    async createUsuario(@Body usuario:Usuario, res: Response):Promise<void>{
        try{
            const nuevoUsuario = await this.usuarioService.crearUsuario(usuario);
            res.status(201).json(nuevoUsuario);
        }catch(error){
            res.status(500).json({message:'Error al crear el usuario', error});
        }
    }

    @Patch('/usuario/:id')
    async updateUsuario(@Param('id') id: string, @Body usuario: Partial<Usuario>, res: Response): Promise<void> {
        try {
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            const usuarioActualizado = await this.usuarioService.actualizarUsuario(id, usuario);
            res.json(usuarioActualizado);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el usuario', error });
        }
    }

    @Put('/usuario/:id')
    async replaceUsuario(@Param('id') id: string, @Body usuario: Usuario, res: Response): Promise<void> {
        try {
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            const usuarioReemplazado = await this.usuarioService.reemplazarUsuario(id, usuario);
            res.json(usuarioReemplazado);
        } catch (error) {
            res.status(500).json({ message: 'Error al reemplazar el usuario', error });
        }
    }

    @Delete('/usuario/:id')
    async deleteUsuario(@Param('id') id: string, res: Response): Promise<void> {
        try {
            const usuarioEliminado = await this.usuarioService.eliminarUsuario(id);
            if (!usuarioEliminado) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el usuario', error });
        }
    }
}