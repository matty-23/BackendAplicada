import { Planilla, ValorAtributo, Atributo } from './Planilla';

export class Equipo {

    private readonly id: string;
    private inventario: Inventario;
    private readonly fechaIngreso: Date;
    private estado: string;
    private categoria: string;
    private codigo: string;
    private readonly Planilla: Planilla;
    private valoresAtributos: ValorAtributo[];

    constructor(
        id: string,
        inventario: Inventario,
        estado: string,
        categoria: string,
        codigo: string,
        Planilla: Planilla,
        valoresAtributos: ValorAtributo[] = [],
        fechaIngreso: Date = new Date()
    ) {
        this.id = id;
        this.inventario = inventario;
        this.estado = estado;
        this.categoria = categoria;
        this.codigo = codigo;
        this.Planilla = Planilla;
        this.fechaIngreso = fechaIngreso;
        this.valoresAtributos = [];

        valoresAtributos.forEach(v => this.agregarValor(v));
    }
    public convertirIdInventarioAEnum(idInventario: Inventario | number | string): Inventario {
        if (typeof idInventario === 'string') {
            idInventario = idInventario.trim().toUpperCase();
        }
        switch (idInventario) {
            case 1:
                return Inventario.UAP;
            case 2:
                return Inventario.TEMPLO;
            case '1':
                return Inventario.UAP;
            case '2':
                return Inventario.TEMPLO;
            case "UAP":
                return Inventario.UAP;
            case "TEMPLO":
                return Inventario.TEMPLO;
            case Inventario.UAP:
                return Inventario.UAP;
            case Inventario.TEMPLO:
                return Inventario.TEMPLO;
            default:
                throw new Error(`Valor no válido para idInventario: ${idInventario}`);
        }
    }
    public getId(): string {
        return this.id;
    }

    public getInventario(): Inventario {
        return this.inventario;
    }

    public getFechaIngreso(): Date {
        return this.fechaIngreso;
    }

    public getEstado(): string {
        return this.estado;
    }

    public getCategoria(): string {
        return this.categoria;
    }

    public getCodigo(): string {
        return this.codigo;
    }

    public getPlanilla(): Planilla {
        return this.Planilla;
    }

    public getValoresAtributos(): ValorAtributo[] {
        return [...this.valoresAtributos];
    }

    public setInventario(inventario: Inventario): void {
        this.inventario = inventario;
    }

    public setEstado(estado: string): void {
        this.estado = estado;
    }

    public setCategoria(categoria: string): void {
        this.categoria = categoria;
    }

    public setCodigo(codigo: string): void {
        this.codigo = codigo;
    }

    public agregarValor(valorAtributo: ValorAtributo): void {
        const atributo = valorAtributo.getAtributo();

        if (!this.Planilla.tieneAtributo(atributo)) {
            throw new Error(
                `El atributo "${atributo.getNombre()}" no pertenece a la Planilla "${this.Planilla.getNombre()}"`
            );
        }

        if (this.obtenerValorPorAtributo(atributo)) {
            throw new Error(
                `Ya existe un valor cargado para "${atributo.getNombre()}" en este equipo`
            );
        }

        this.valoresAtributos.push(valorAtributo);
    }

    public quitarValor(atributo: Atributo): void {
        this.valoresAtributos = this.valoresAtributos.filter(
            v => !v.getAtributo().equals(atributo)
        );
    }

    public obtenerValorPorAtributo(atributo: Atributo): ValorAtributo | undefined {
        return this.valoresAtributos.find(v => v.getAtributo().equals(atributo));
    }
}
export enum Inventario {
    UAP = 1,
    TEMPLO = 2
}