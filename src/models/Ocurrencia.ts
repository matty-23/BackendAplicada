import { Usuario } from './Usuario';

export class Ocurrencia {

    private participantesPromise?: Promise<Usuario[]>;

    constructor(
        private id: string,
        private idEvento: string,// Clave que conecta con el Evento padre
        private fechaInicio: Date,
        private fechaFinalizacion: Date,
        private tipo: string = "normal",
        private esModificado: boolean = false,
        private lugar?: string,
        private cantidadPersonas: number = 0,
        private encargado?: Usuario,
        private participantes: Array<Usuario> = [], // Inicializado por defecto
        private id_api_google?: string,
        private loaderParticipantes?: () => Promise<Usuario[]>

    ) { }
    // --- GETTERS ---

    getId(): string {
        return this.id;
    }
    getIdApiGoogle(): string | undefined {
        return this.id_api_google;
    }
    getTipo(): string {
        return this.tipo;
    }

    setTipo(tipo: string): void {
        this.tipo = tipo;
    }

    getIdEvento(): string {
        return this.idEvento;
    }

    getFechaInicio(): Date {
        return this.fechaInicio;
    }

    getFechaFinalizacion(): Date {
        return this.fechaFinalizacion;
    }

    getCantidadPersonas(): number {
        return this.cantidadPersonas;
    }

    getEncargado(): Usuario | undefined {
        return this.encargado;
    }

    getLugar(): string | undefined {
        return this.lugar;
    }

    getParticipantes(): Usuario[] {
        return this.participantes;
    }
    // --- SETTERS ---
getEsModificado(): boolean {
    return this.esModificado;
}

setEsModificado(valor: boolean): void {
    this.esModificado = valor;
}
    setId(id: string): void {
        this.id = id;
    }

    setIdEvento(idEvento: string): void {
        this.idEvento = idEvento;
    }

    setFechaInicio(fechaInicio: Date): void {
        this.fechaInicio = fechaInicio;
    }

    setFechaFinalizacion(fechaFinalizacion: Date): void {
        this.fechaFinalizacion = fechaFinalizacion;
    }

    setCantidadPersonas(cantidadPersonas: number): void {
        this.cantidadPersonas = cantidadPersonas;
    }


    setLugar(lugar: string): void {
        this.lugar = lugar;
    }
    setIdApiGoggle(idApi: string): void {
        this.id_api_google = idApi;
    }
    setEncargado(encargado?: Usuario): void {
        this.encargado = encargado;
    }

    setParticipantes(participantes: Array<Usuario>): void {
        this.participantes = participantes;
    }

}