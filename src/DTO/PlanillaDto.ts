import { IsBoolean, IsDate, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { Planilla, ValorAtributo, Atributo } from "../models/Planilla";
export class PlanillaDto {
    
@IsOptional() @IsString()
    id!: string;
    
@IsOptional() @IsString()
    nombre?: string;
    
@IsOptional() @IsDate()
    fechaCreacion?: Date;
    
@IsOptional() @IsDate()
    fechaModificacion?: Date;
    
@IsOptional() 
    atributos?: Atributo[];
}