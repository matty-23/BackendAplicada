import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum PrioridadCorreo {
    ALTA = 'alta',
    NORMAL = 'normal',
    BAJA = 'baja'
}

export class CorreoDTO {
    @IsArray()
    @IsNotEmpty()
    readonly destinatarios!: string[];

    @IsOptional()
    @IsString()
    readonly asunto?: string;

    @IsNotEmpty()
    @IsString()
    readonly mensajeHtml!: string;

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

export class CorreoRecuperacionContrasenaDTO {
    @IsString()
    @IsNotEmpty()
    readonly destinatario!: string;

    @IsNotEmpty()
    @IsString()
    readonly asunto!: string;

    @IsNotEmpty()
    @IsString()
    readonly linkRecuperacion!: string;

    @IsNotEmpty()
    @IsString()
    readonly mensaje!: string;
}

export class CorreoConfirmacionCuentaDTO {
    @IsString()
    @IsNotEmpty()
    readonly destinatario!: string;

    @IsNotEmpty()
    @IsString()
    readonly asunto!: string;

    @IsNotEmpty()
    @IsString()
    readonly mensajeConfirmacion!:string;

}
