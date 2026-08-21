import { IsNumberString, IsString, IsNotEmpty, IsOptional, Max, IsInt, Min, IsIn } from 'class-validator';

export class ObtenerUsuarioDTO {
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

export class CrearUsuarioDTO {
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

export class ActualizarUsuarioDTO {

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
    readonly departamento?: string;

    @IsString()
    @IsOptional()
    readonly rol?: string;
}

export class ActualizarUsuarioCompletoDTO {
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

export class GetUsuariosQueryDTO {
    @IsOptional()
    @IsString()
    rol?: string;

    @IsOptional()
    @IsString()
    busqueda?: string;

    @IsOptional()
    @IsString()
    departamento?: string;

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsIn(['nombre', 'apellido', 'correo'])
    ordenar: 'nombre' | 'apellido' | 'correo' = 'apellido';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    orden: 'asc' | 'desc' = 'asc';

    @IsOptional()
    @IsNumberString()
    skip?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

}