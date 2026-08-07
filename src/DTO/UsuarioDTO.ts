import { IsNumber, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
export class ObtenerUsuarioDTO{
    @IsString()
    @IsNotEmpty()
    readonly id!: string;

    @IsString()
    @IsNotEmpty()
    readonly nombre!: string;

    @IsString()
    @IsNotEmpty()
    readonly apellido!: string;

    @IsString()
    @IsNotEmpty()
    readonly correo!: string;

    @IsNotEmpty()
    @IsString()
    readonly departamento!: string;

    @IsString()
    @IsNotEmpty()
    readonly rol!: string;

}

export class CrearUsuarioDTO{
    @IsString()
    @IsNotEmpty()
    readonly nombre!: string;

    @IsString()
    @IsNotEmpty()
    readonly apellido!: string;

    @IsString()
    @IsNotEmpty()
    readonly correo!: string;

    @IsString()
    @IsNotEmpty()
    readonly contraseña!: string;

    @IsString()
    @IsNotEmpty()
    readonly departamento!: string;

    @IsString()
    @IsNotEmpty()
    rol!: string;
}

export class ActualizarUsuarioDTO{
    @IsString()
    @IsNotEmpty()
    readonly id!: string;

    @IsString()
    @IsOptional()
    readonly nombre?: string;

    @IsString()
    @IsOptional()
    readonly apellido?: string;

    @IsString()
    @IsOptional()
    readonly correo?: string;

    @IsString()
    @IsOptional()
    readonly contraseña?: string;

    @IsString()
    @IsOptional()
    readonly departamento?: string;

    @IsString()
    @IsOptional()
    readonly rol?: string;
}

export class ActualizarUsuarioCompletoDTO{
    @IsString()
    @IsNotEmpty()
    readonly id!: string;

    @IsString()
    @IsNotEmpty()
    readonly nombre!: string;

    @IsString()
    @IsNotEmpty()
    readonly apellido!: string;

    @IsString()
    @IsNotEmpty()
    readonly correo!: string;

    @IsString()
    @IsNotEmpty()
    readonly contraseña!: string;

    @IsString()
    @IsNotEmpty()
    readonly departamento!: string;

    @IsString()
    @IsNotEmpty()
    readonly rol!: string;
}