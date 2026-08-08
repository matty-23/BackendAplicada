import { IsNumber, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    readonly correo!: string;

    @IsString()
    @IsNotEmpty()
    readonly contraseña!: string;
    }

export class RefreshTokenDTO {
    @IsString()
    @IsNotEmpty()
    readonly refreshToken!: string;
}

//A definir bien. Implica bastante flujo y conexion con APIS
export class ChangePasswordDTO {
    @IsString()
    @IsNotEmpty()
    readonly newPassword!: string;
}