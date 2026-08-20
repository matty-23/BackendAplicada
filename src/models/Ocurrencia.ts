import { Usuario } from './Usuario';

export class Ocurrencia {

    private participantesPromise?: Promise<Usuario[]>;

constructor(
    private id: string,
    private idEvento: string,// Clave que conecta con el Evento padre
    private fechaInicio: Date,
    private fechaFinalizacion: Date,
    private lugar?: string, // Opcional o removible según tu necesidad
    private cantidadPersonas: number = 0,
    private encargado?: Usuario, 
    private participantes: Array<Usuario> = [], // Inicializado por defecto
    private loaderParticipantes?: () => Promise<Usuario[]>
    ) {}
    // --- GETTERS ---

    getId(): string {
        return this.id;
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

async getParticipantes(): Promise<Usuario[]> {
        // Si ya están en memoria (ej. se cargaron al crear el objeto), los devolvemos
        if (this.participantes) {
            return this.participantes;
        }
        // Si tenemos un loader, lo usamos
        if (this.loaderParticipantes) {
            // Evitamos llamar a la BD 2 veces si ya hay una petición en curso
            if (!this.participantesPromise) {
                this.participantesPromise = this.loaderParticipantes().then(data => {
                    this.participantes = data; // Los guardamos en caché
                    return data;
                });
            }
            return this.participantesPromise;
        }
        // Si no hay participantes ni loader, devolvemos un array vacío
        return [];
    }
    // --- SETTERS ---

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

    setEncargado(encargado: Usuario): void {
        this.encargado = encargado;
    }

    setParticipantes(participantes: Array<Usuario>): void {
        this.participantes = participantes;
    }
}