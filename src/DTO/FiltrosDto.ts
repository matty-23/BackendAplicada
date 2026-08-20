// src/DTO/FiltrosDto.ts
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class filtrosEventoDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsString()
    busqueda?: string;

    @IsOptional()
    @IsString()
    categoria?: string;

    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @Type(() => Date)
    fechaInicio?: Date;

    @IsOptional()
    @Type(() => Date)
    fechaFin?: Date;

    @IsOptional()
    @IsString()
    participanteId?: string;
}