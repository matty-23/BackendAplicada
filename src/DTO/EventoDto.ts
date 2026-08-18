// src/dtos/crear-evento.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsOptional, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OcurrenciaDto } from './OcurrenciaDto';

// Para POST /api/eventos/mono
export class CrearEventoMonoDTO {
    @IsString()
    @IsNotEmpty()
    readonly titulo!: string;

    @IsString()
    @IsOptional()
    readonly categoria?: string;

    @ValidateNested()
    @Type(() => OcurrenciaDto)
    readonly ocurrencia!: OcurrenciaDto;
}

// Para POST /api/eventos/multi
export class CrearEventoMultiDTO {
    @IsString()
    @IsNotEmpty()
    readonly titulo!: string;

    @IsString()
    @IsOptional()
    readonly categoria?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OcurrenciaDto)
    readonly ocurrencias!: OcurrenciaDto[];
}
export class EncargadoDto {
    @IsString()
    @IsNotEmpty()
    readonly usuarioId!: string;
}
export class ActualizarOcurrenciaDTO {
    @IsString()
    @IsNotEmpty()
    readonly id!: string;

    @IsString()
    @IsOptional()
    readonly lugar?: string;

    @IsString()
    @IsOptional()
    readonly fechaInicio?: string;

    @IsString()
    @IsOptional()
    readonly fechaFinalizacion?: string;

    @IsNumber()
    @IsOptional()
    readonly cantidadPersonas?: number;
}

// Y modifica tu clase ActualizarEventoDTO existente así:
export class ActualizarEventoDTO {
    @IsString()
    @IsOptional()
    readonly titulo?: string;

    @IsString()
    @IsOptional()
    readonly categoria?: string;

    @IsString()
    @IsOptional()
    readonly estado?: string;

    // 👈 NUEVO CAMPO AÑADIDO
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActualizarOcurrenciaDTO)
    @IsOptional()
    readonly ocurrencias?: ActualizarOcurrenciaDTO[];
}