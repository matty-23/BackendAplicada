import { Ocurrencia } from "./Ocurrencia";
export class Evento {
    private id: string;
    private nombre: string;
    private estado: string;
    private categoria: string;
    private color: string = "#B2FFFF";
    private ocurrencias?: Ocurrencia[];
    private recurrencia?: string;
    private ocurrenciasLoader?: () => Promise<Ocurrencia[]>; // Propiedad para la carga perezosa

    constructor(
        id: string,
        nombre: string,
        estado: string,
        categoria: string,
        color: string = "#B2FFFF",
        recurrencia?: string,
        ocurrencias?: Ocurrencia[],
        ocurrenciasLoader?: () => Promise<Ocurrencia[]> // <--- Aceptamos el 6to argumento
    ) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.categoria = categoria;
        this.ocurrencias = ocurrencias;
        this.color = color;
        this.recurrencia = recurrencia;
        this.ocurrenciasLoader = ocurrenciasLoader;
    }

    getId(): string {
        return this.id;
    }

    getNombre(): string {
        return this.nombre;
    }

    getColor(): string {
        return this.color;
    }

    setColor(color: string): void {
        this.color = color;
    }


    getRecurrencia(): string | undefined {
        return this.recurrencia;
    }

    setRecurrencia(recurrencia: string | undefined): void {
        this.recurrencia = recurrencia;
    }
    async getOcurrencias(): Promise<Ocurrencia[]> {
        if (!this.ocurrencias && this.ocurrenciasLoader) {
            this.ocurrencias = await this.ocurrenciasLoader();
        }
        return this.ocurrencias ?? [];
    }

    getEstado(): string {
        return this.estado;
    }

    getCategoria(): string {
        return this.categoria;
    }

    setId(id: string): void {
        this.id = id;
    }

    setNombre(nombre: string): void {
        this.nombre = nombre;
    }

    setEstado(estado: string): void {
        this.estado = estado;
    }

    setCategoria(categoria: string): void {
        this.categoria = categoria;
    }


    setOcurrencias(ocurrencias: Array<Ocurrencia>): void {
        this.ocurrencias = ocurrencias;
    }
}
