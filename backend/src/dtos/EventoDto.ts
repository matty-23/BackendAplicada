export class EventoDto {
        readonly id?: string;
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly encargado?: Array<String>; 
        readonly participantes?: Array<String>; 
        readonly lugar!: string;
        readonly categoria?: number;
        readonly cantidadPersonas!: number;
}

export class CrearEventoDto {
        readonly nombre!: string;
        readonly fechaInicio!: Date;
        readonly fechaFinalizacion!: Date;
        readonly lugar!: string;
        readonly categoria?: number;
        readonly cantidadPersonas!: number;
}