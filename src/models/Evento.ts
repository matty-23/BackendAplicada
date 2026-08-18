import {Usuario} from './Usuario';
export class Evento {
    private id: string;
    private nombre: string;
    private fechaInicio: Date;
    private fechaFinalizacion: Date;
    private encargado?: Usuario; 
    private participantes?: Array<Usuario>; 
    private lugar: string;
    private estado: string;
    private categoria: string;
    private cantidadPersonas: number;
    //private equipamiento?: Array<Equipo>; 

    constructor(id: string, nombre: string, fechaInicio: Date, fechaFinalizacion: Date, cantidadPersonas: number, lugar: string, estado: string, categoria: string) {
        this.id = id;
        this.nombre = nombre;
        this.fechaInicio = fechaInicio;
        this.fechaFinalizacion = fechaFinalizacion;
        this.cantidadPersonas = cantidadPersonas;
        this.lugar = lugar;
        this.estado = estado;
        this.categoria = categoria;
    }


    
    getId(): string {
        return this.id;
    }

    getNombre(): string {
        return this.nombre;
    }

    getFechaInicio(): Date {
        return this.fechaInicio;
    }
    getFechaFinalizacion(): Date {
        return this.fechaFinalizacion;
    }

    getEncargado(): Usuario | undefined {
        if(this.encargado){
        return this.encargado;}
        return undefined;
    }

    getParticipantes(): Array<Usuario>{
        if (!this.participantes) {
            this.participantes = [];
        }
        return this.participantes;
    }

    getCantidadPersonas(): number {
        return this.cantidadPersonas;
    }

    getLugar(): string {
        return this.lugar;
    }

    getEstado(): string {
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

    setFechaInicio(fechaInicio: Date): void {
         this.fechaInicio = fechaInicio;
    }
    setFechaFinalizacion(fechaFinalizacion: Date): void {
         this.fechaFinalizacion = fechaFinalizacion;
    }

    setEncargado(encargado: Usuario): void {
         this.encargado = encargado;
    }

    setParticipantes(usuariosAsignados: Array<Usuario>): void {
         this.participantes = usuariosAsignados;
    }

    setLugar(lugar: string): void {
         this.lugar = lugar;
    }

    setEstado(estado: string): void {
         this.estado = estado;
    }

    setCategoria(categoria: string): void {
         this.categoria = categoria;
    }

    setCantidadPersonas(cantidadPersonas: number): void {
         this.cantidadPersonas = cantidadPersonas;
    }
    //setEquipamiento(equipamiento: Array<Equipo>): void {
    //     this.equipamiento = equipamiento;
    //}
}
