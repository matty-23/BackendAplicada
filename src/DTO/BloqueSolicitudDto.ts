import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class BloqueSolicitudDto {
    @IsString()
    @IsOptional()
    readonly id?: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaInicio!: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaFinalizacion!: string;

    @IsString()
    @IsNotEmpty()
    readonly lugar!: string;
}
