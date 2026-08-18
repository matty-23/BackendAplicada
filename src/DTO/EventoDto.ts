import { Usuario } from "../models/Usuario";
export class EventoDto {
        readonly id?: string;
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly encargado?: Usuario;
        readonly participantes?: Array<Usuario>;
        readonly lugar!: string;
        readonly categoria?: string;
        readonly cantidadPersonas!: number;
}

export class EncargadoDto {
        readonly usuarioId!: string;
}
export class CrearEventoDto {
        readonly id!: string;
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly lugar!: string;
        readonly categoria?: string;
        readonly cantidadPersonas!: number;
}