import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum PrioridadCorreo {
    ALTA = 'alta',
    NORMAL = 'normal',
    BAJA = 'baja'
}

export class CorreoDTO {
    @IsString()
    @IsNotEmpty()
    readonly destinatario!: string;

    @IsOptional()
    @IsString()
    readonly asunto?: string;

    @IsOptional()
    @IsString()
    readonly mensajeHtml?: string;

    @IsOptional()
    @IsEnum(PrioridadCorreo)
    readonly prioridad?: PrioridadCorreo;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ArchivoAdjuntoDTO)
    readonly archivosAdjuntos?: ArchivoAdjuntoDTO[];
}

export class ArchivoAdjuntoDTO {
    @IsString()
    @IsNotEmpty()
    readonly filename!: string;

    @IsString()
    @IsNotEmpty()
    readonly content!: string; 
}

export class CorreoRecuperacionContrasenaDTO {}

export class CorreoConfirmacionCuentaDTO {}
