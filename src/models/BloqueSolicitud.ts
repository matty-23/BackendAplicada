export class BloqueSolicitud {
    constructor(
        private id: string,
        private idSolicitud: string,
        private fechaInicio: Date,
        private fechaFinalizacion: Date,
        private lugar: string
    ) {}

    getId(): string {
        return this.id;
    }

    getIdSolicitud(): string {
        return this.idSolicitud;
    }

    getFechaInicio(): Date {
        return this.fechaInicio;
    }

    getFechaFinalizacion(): Date {
        return this.fechaFinalizacion;
    }

    getLugar(): string {
        return this.lugar;
    }

    setId(id: string): void {
        this.id = id;
    }

    setIdSolicitud(idSolicitud: string): void {
        this.idSolicitud = idSolicitud;
    }

    setFechaInicio(fechaInicio: Date): void {
        this.fechaInicio = fechaInicio;
    }

    setFechaFinalizacion(fechaFinalizacion: Date): void {
        this.fechaFinalizacion = fechaFinalizacion;
    }

    setLugar(lugar: string): void {
        this.lugar = lugar;
    }
}
