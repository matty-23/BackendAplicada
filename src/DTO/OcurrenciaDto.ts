// src/dtos/ocurrencia.dto.ts
import { IsString, IsBoolean, IsArray, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional } from 'class-validator';

export class OcurrenciaDto {
    @IsDateString() @IsNotEmpty()
    readonly fechaInicio!: string;
    @IsDateString() @IsNotEmpty()
    readonly fechaFinalizacion!: string;
    @IsString() @IsOptional() 
    readonly tipo?: string; 
    @IsString() @IsNotEmpty()
    readonly lugar!: string;
    @IsNumber() @Min(1)
    readonly cantidadPersonas!: number;
    @IsString() @IsOptional()
    readonly id_encargado?: string | null;
    @IsArray() @IsString({ each: true }) @IsOptional()
    readonly participantes?: string[];
    @IsDateString() @IsOptional()
    readonly ocurrencia_original?: string;
    @IsString() @IsOptional()
    readonly idApiGoogle?: string;
}
export class ActualizarOcurrenciaDTO {
    @IsString() @IsNotEmpty()
    readonly id!: string;
    @IsString() @IsOptional()
    readonly lugar?: string;
    @IsString() @IsOptional()
    readonly fechaInicio?: string;
    @IsString() @IsOptional()
    readonly fechaFinalizacion?: string;
    @IsString() @IsOptional() 
    readonly tipo?: string; 
    @IsNumber() @IsOptional()
    readonly cantidadPersonas?: number;
    @IsString() @IsOptional()
    readonly id_encargado?: string | null;
    @IsArray() @IsString({ each: true }) @IsOptional()
    readonly participantes?: string[];
    @IsDateString() @IsOptional()
    readonly ocurrencia_original?: string;
    @IsString() @IsOptional()
    readonly idApiGoogle?: string;
    @IsBoolean() @IsOptional()
    readonly fueActualizado?: boolean;
}