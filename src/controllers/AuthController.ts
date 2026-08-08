import { ObtenerUsuarioDTO, CrearUsuarioDTO } from "../DTO/UsuarioDTO";
import { type IUsuarioService } from "../interfaces/IUsuarioService";
import { Controller, Get, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete,HttpCode, HttpStatus} from '@nestjs/common';

@Controller('/api/auth')
export class AuthController{
    
    constructor(@Inject ('IUsuarioService') private readonly usuarioService: IUsuarioService) {}

        @Post('/register')
        async createUsuario(@Body() CrearUsuarioDTO: CrearUsuarioDTO):Promise<ObtenerUsuarioDTO>{
            //Falta hashear la contraseña antes de guardar el usuario
            return await this.usuarioService.crearUsuario(CrearUsuarioDTO);
        }

        @Post('/login')
        async login(@Body() loginData: { correo: string; contraseña: string }): Promise<{ token: string } | { error: string }> {
            const { correo, contraseña } = loginData;
            const usuario = await this.usuarioService.obtenerUsuarioPorId(correo);
            return usuario ? { token: 'fake-jwt-token' } : { error: 'Invalid credentials' };
        }

        @Post('/logout')
        async logout(): Promise<{ message: string }> {
            return { message: 'Logged out successfully' };
        }

        @Post('/refresh-token')
        async refreshToken(@Body() refreshTokenData: { refreshToken: string }): Promise<{ token: string } | { error: string }> {
            const { refreshToken } = refreshTokenData;
            return refreshToken === 'valid-refresh-token' ? { token: 'new-fake-jwt-token' } : { error: 'Invalid refresh token' };
        }

        //Este endpoint llama a AuthService que hace las validaciones de seguridad
        @Patch('/change-password/:id')
        async changePassword(@Param('id') id: string, @Body() passwordData: { newPassword: string }): Promise<{ message: string } | { error: string }> {
            const { newPassword } = passwordData;
            const usuarioExistente = await this.usuarioService.obtenerUsuarioPorId(id);
            if (!usuarioExistente) {
                return { error: 'User not found' };
            }
            // Aquí deberías llamar a un método del servicio para cambiar la contraseña
            return { message: 'Password changed successfully' };
        }
     
}