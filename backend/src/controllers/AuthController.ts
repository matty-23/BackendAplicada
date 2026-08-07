import { ObtenerUsuarioDTO, CrearUsuarioDTO } from "src/DTO/UsuarioDTO";
import { type IUsuarioService } from "src/interfaces/IUsuarioService";
import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete,HttpCode, HttpStatus} from '@nestjs/common';

@Controller('/api/auth')
export class AuthController{
    
    constructor(@Inject ('IUsuarioService') private readonly usuarioService: IUsuarioService) {}

        @Post('/register')
        async createUsuario(@Body() CrearUsuarioDTO: CrearUsuarioDTO):Promise<ObtenerUsuarioDTO>{
            return await this.usuarioService.crearUsuario(CrearUsuarioDTO);
        }
     
}