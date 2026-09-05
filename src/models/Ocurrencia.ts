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
        private ocurrencia_original?: Date,
        private loaderParticipantes?: () => Promise<Usuario[]>

    ) { }

    getId(): string {
        return this.id;
    }

    getOcurrenciaOriginal(): Date | undefined {
        return this.ocurrencia_original;
    }
    getIdApiGoogle(): string | undefined {
        return this.id_api_google;
    }
    getTipo(): string {
        return this.tipo;
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
    getEsModificado(): boolean {
        return this.esModificado;
    }
     // --- SETTERS ---
    setOcurrenciaOriginal(fecha: Date): void {
        this.ocurrencia_original = fecha;
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

    setTipo(tipo: string): void {
        this.tipo = tipo;
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

    setIdApiGoogle(idApi: string): void {
        this.id_api_google = idApi;
    }
    
    setEncargado(encargado?: Usuario): void {
        this.encargado = encargado;
    }

    setParticipantes(participantes: Array<Usuario>): void {
        this.participantes = participantes;
    }

}