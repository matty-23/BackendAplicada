import { Inventario } from "../models/Equipamiento";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { Planilla, ValorAtributo } from "../models/Planilla";
export class EquipamientoDto {
    id!: string;
    idInventario: Inventario | number | string = Inventario.UAP;
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
    valoresAtributos: ValorAtributo[] = [];

}
