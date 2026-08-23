import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean, ValidateNested, IsArray, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BloqueSolicitudDto } from './BloqueSolicitudDto';

// Para POST /api/solicitudes
export class CrearSolicitudDto {
    @IsString()
    @IsNotEmpty()
    readonly tipoEvento!: string;

    @IsNumber()
    @IsOptional()
    readonly cantidadPersonas?: number;

    @IsString()
    @IsOptional()
    readonly personaEncargada?: string;

    @IsBoolean()
    readonly necesidadOperario!: boolean;

    @IsBoolean()
    readonly autorizacionRectoria!: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BloqueSolicitudDto)
    readonly bloques!: BloqueSolicitudDto[];
}

// Para PUT /api/solicitudes/:id (modificación por parte del solicitante antes de ser procesada)
export class ModificarSolicitudDto {
    @IsString()
    @IsOptional()
    readonly tipoEvento?: string;

    @IsNumber()
    @IsOptional()
    readonly cantidadPersonas?: number;

    @IsString()
    @IsOptional()
    readonly personaEncargada?: string;

    @IsBoolean()
    @IsOptional()
    readonly necesidadOperario?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly autorizacionRectoria?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BloqueSolicitudDto)
    @IsOptional()
    readonly bloques?: BloqueSolicitudDto[];
}

// Para PATCH /api/solicitudes/:id/aceptar (el Administrador/Empleado define tiempo y cupo de operarios)
export class AceptarSolicitudDto {
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    readonly tiempoAnticipacion!: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    readonly cantidadOperariosDesignados?: number;
}

// Para filtros de búsqueda
export class FiltrosSolicitudDto {
    @IsString()
    @IsOptional()
    readonly estado?: string;

    @IsString()
    @IsOptional()
    readonly solicitanteId?: string;

    @IsString()
    @IsOptional()
    readonly tipoEvento?: string;
}

// Para PATCH /api/solicitudes/:id/rechazar
export class RechazarSolicitudDto {
    @IsString()
    @IsOptional()
    readonly motivo?: string;
}

