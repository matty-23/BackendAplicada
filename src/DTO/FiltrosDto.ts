import { Usuario } from "../models/Usuario";
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class filtrosEventoDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
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
    fechaInicio?:Date;
    @IsOptional()
    @Type(() => Date)
    fechaFin?:Date
    @IsOptional()
    participanteId?: string
}