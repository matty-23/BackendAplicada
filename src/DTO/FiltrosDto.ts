// src/DTO/FiltrosDto.ts
import { IsOptional, IsString, IsInt, Min, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Planilla, ValorAtributo } from '../models/Planilla';
export class filtrosEventoDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    orden: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsIn(['fecha', 'titulo'])
    ordenarPor: 'fecha' | 'titulo' = 'fecha';

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

    @IsOptional()
    @IsString()
    encargadoId?: string;
}

export class filtrosEquipamientoDto {

    idInventario?: string;
    @IsOptional()
    fechaIngreso?: Date;
    @IsOptional() @IsString()
    estado?: string;
    @IsOptional() @IsString()
    categoria?: string;
    @IsOptional() @IsString()
    codigo?: string;
    @IsOptional()
    Planilla?: Planilla;
    @IsOptional() @IsString()
    busqueda?: string;
    @IsBoolean()
    valor: boolean = true;
    @IsBoolean()
    atributo: boolean = true;
    @IsBoolean()
    planilla: boolean = true;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    page?: number = 1;

}

export class filtrosPlanillaDto {
    @IsOptional() @IsString()
    nombre?: string
}