import { BloqueSolicitud } from './BloqueSolicitud';

export class Solicitud {
    private id: string;
    private idUsuarioSolicitante: string;
    private tipoEvento: string;
    private estado: string;
    private cantidadPersonas?: number;
    private personaEncargada?: string;
    private necesidadOperario: boolean;
    private autorizacionRectoria: boolean;
    private tiempoAnticipacion?: number;
    private cantidadOperariosDesignados?: number;
    private bloques?: BloqueSolicitud[];
    private bloquesLoader?: () => Promise<BloqueSolicitud[]>;

    constructor(
        id: string,
        idUsuarioSolicitante: string,
        tipoEvento: string,
        estado: string,
        necesidadOperario: boolean = false,
        autorizacionRectoria: boolean = false,
        cantidadPersonas?: number,
        personaEncargada?: string,
        tiempoAnticipacion?: number,
        cantidadOperariosDesignados?: number,
        bloques?: BloqueSolicitud[],
        bloquesLoader?: () => Promise<BloqueSolicitud[]>
    ) {
        this.id = id;
        this.idUsuarioSolicitante = idUsuarioSolicitante;
        this.tipoEvento = tipoEvento;
        this.estado = estado;
        this.necesidadOperario = necesidadOperario;
        this.autorizacionRectoria = autorizacionRectoria;
        this.cantidadPersonas = cantidadPersonas;
        this.personaEncargada = personaEncargada;
        this.tiempoAnticipacion = tiempoAnticipacion;
        this.cantidadOperariosDesignados = cantidadOperariosDesignados;
        this.bloques = bloques;
        this.bloquesLoader = bloquesLoader;
    }

    getId(): string {
        return this.id;
    }

    getIdUsuarioSolicitante(): string {
        return this.idUsuarioSolicitante;
    }

    getTipoEvento(): string {
        return this.tipoEvento;
    }

    getEstado(): string {
        return this.estado;
    }

    getCantidadPersonas(): number | undefined {
        return this.cantidadPersonas;
    }

    getPersonaEncargada(): string | undefined {
        return this.personaEncargada;
    }

    getNecesidadOperario(): boolean {
        return this.necesidadOperario;
    }

    getAutorizacionRectoria(): boolean {
        return this.autorizacionRectoria;
    }

    getTiempoAnticipacion(): number | undefined {
        return this.tiempoAnticipacion;
    }

    getCantidadOperariosDesignados(): number | undefined {
        return this.cantidadOperariosDesignados;
    }

    async getBloques(): Promise<BloqueSolicitud[]> {
        if (!this.bloques && this.bloquesLoader) {
            this.bloques = await this.bloquesLoader();
        }
        return this.bloques ?? [];
    }

    setId(id: string): void {
        this.id = id;
    }

    setIdUsuarioSolicitante(idUsuarioSolicitante: string): void {
        this.idUsuarioSolicitante = idUsuarioSolicitante;
    }

    setTipoEvento(tipoEvento: string): void {
        this.tipoEvento = tipoEvento;
    }

    setEstado(estado: string): void {
        this.estado = estado;
    }

    setCantidadPersonas(cantidad: number): void {
        this.cantidadPersonas = cantidad;
    }

    setPersonaEncargada(encargada: string): void {
        this.personaEncargada = encargada;
    }

    setNecesidadOperario(necesidad: boolean): void {
        this.necesidadOperario = necesidad;
    }

    setAutorizacionRectoria(autorizacion: boolean): void {
        this.autorizacionRectoria = autorizacion;
    }

    setTiempoAnticipacion(tiempo: number): void {
        this.tiempoAnticipacion = tiempo;
    }

    setCantidadOperariosDesignados(cantidad: number): void {
        this.cantidadOperariosDesignados = cantidad;
    }

    setBloques(bloques: BloqueSolicitud[]): void {
        this.bloques = bloques;
    }
}
