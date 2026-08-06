import { IsNumber, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
export class ObtenerUsuarioDTO{
    @IsNumber()
    @IsNotEmpty()
    readonly id!: number;

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

}