import { Usuario } from "src/models/Usuario";
export class EventoDto {
        readonly id?: string;
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly encargado!: Array<Usuario>; 
        readonly participantes!: Array<Usuario>; 
        readonly lugar!: string;
        readonly categoria?: string;
        readonly cantidadPersonas!: number;
}

export class CrearEventoDto {
        readonly id!:string;
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly lugar!: string;
        readonly categoria?: string;
        readonly cantidadPersonas!: number;
}