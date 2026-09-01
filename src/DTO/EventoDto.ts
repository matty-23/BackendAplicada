// src/dtos/crear-evento.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsOptional, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OcurrenciaDto } from './OcurrenciaDto';
import { ActualizarOcurrenciaDTO } from './OcurrenciaDto';
// Para POST /api/eventos/multi
export class CrearEventoMultiDTO { 
    @IsString() @IsNotEmpty() 
    readonly titulo!: string; 
    @IsString() @IsOptional() 
    readonly categoria?: string; 
    @IsArray() @ArrayMinSize(1) 
    @ValidateNested({ each: true }) 
    @Type(() => OcurrenciaDto) 
    readonly ocurrencias!: OcurrenciaDto[]; 
    @IsString() @IsOptional() 
    readonly color?: string; 
    @IsString() @IsOptional() 
    readonly recurrencia?: string; }

export class EncargadoDto {
    @IsString() @IsNotEmpty()
    readonly usuarioId!: string;
}


export class ActualizarEventoDTO {
    @IsString() @IsOptional()
    readonly titulo?: string;
    @IsString() @IsOptional()
    readonly categoria?: string;
    @IsString() @IsOptional()
    readonly estado?: string;
    @IsString() @IsOptional()
    readonly color?: string;
    @IsString() @IsOptional()
    readonly tipo?: string;
    @IsString() @IsOptional()
    readonly recurrencia?: string;
    @IsArray() @ValidateNested({ each: true }) @Type(() => ActualizarOcurrenciaDTO) @IsOptional()
    readonly ocurrencias?: ActualizarOcurrenciaDTO[];
}

