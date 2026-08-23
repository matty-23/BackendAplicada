import { Ocurrencia } from "./Ocurrencia";
export class Evento {
    private id: string;
    private nombre: string;
    private estado: string;
    private categoria: string;
    private ocurrencias?: Ocurrencia[];
    private ocurrenciasLoader?: () => Promise<Ocurrencia[]>; // Propiedad para la carga perezosa

    constructor(
        id: string,
        nombre: string,
        estado: string,
        categoria: string,
        ocurrencias?: Ocurrencia[],
        ocurrenciasLoader?: () => Promise<Ocurrencia[]> // <--- Aceptamos el 6to argumento
    ) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.categoria = categoria;
        this.ocurrencias = ocurrencias;
        this.ocurrenciasLoader = ocurrenciasLoader;
    }



    getId(): string {
        return this.id;
    }

    getNombre(): string {
        return this.nombre;
    }


    async getOcurrencias(): Promise<Ocurrencia[]> {
        if (!this.ocurrencias && this.ocurrenciasLoader) {
            this.ocurrencias = await this.ocurrenciasLoader();
        }
        return this.ocurrencias ?? [];
    }

    getEstado(): EstadoEvento {
        return this.estado;
    }

    getCategoria(): string {
        return this.categoria;
    }

    //getEquipamiento():Array<Equipo> {
    //    if (!this.equipamiento) {
    //        this.equipamiento = [];
    //    }
    //    return this.equipamiento;
    //}

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
    //setEquipamiento(equipamiento: Array<Equipo>): void {
    //     this.equipamiento = equipamiento;
    //}
}
