
export class Planilla {

    private readonly id: string;
    private nombre: string;
    private readonly fechaCreacion: Date;
    private fechaModificacion: Date;
    private estado: string;
    private atributos: Atributo[];

    constructor(
        id: string,
        nombre: string,
        estado: string,
        atributos: Atributo[] = [],
        fechaCreacion: Date = new Date(),
        fechaModificacion: Date = new Date()
    ) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.atributos = [...atributos];
        this.fechaCreacion = fechaCreacion;
        this.fechaModificacion = fechaModificacion;
    }

    public getId(): string {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public getFechaCreacion(): Date {
        return this.fechaCreacion;
    }

    public getFechaModificacion(): Date {
        return this.fechaModificacion;
    }

    public getEstado(): string {
        return this.estado;
    }

    public getAtributos(): Atributo[] {
        return [...this.atributos];
    }

    public setNombre(nombre: string): void {
        this.nombre = nombre;
    }

    public setEstado(estado: string): void {
        this.estado = estado;
    }

    public setFechaModificacion(fecha: Date): void {
        this.fechaModificacion = fecha;
    }

    public tieneAtributo(atributo: Atributo): boolean {
        return this.atributos.some(a => a.equals(atributo));
    }

    public agregarAtributo(atributo: Atributo): void {
        if (this.tieneAtributo(atributo)) {
            throw new Error(`La plantilla "${this.nombre}" ya tiene el atributo "${atributo.getNombre()}"`);
        }
        this.atributos.push(atributo);
    }

    public quitarAtributo(atributo: Atributo): void {
        this.atributos = this.atributos.filter(a => !a.equals(atributo));
    }
}

export class Atributo {

    private readonly id: string;
    private nombre: string;
    private medida: string | null = null;
    private readonly tipo: TipoAtributo;

    constructor(id: string, nombre: string, tipo: TipoAtributo) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
    }

    public getId(): string {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public getTipo(): TipoAtributo {
        return this.tipo;
    }
    public getMedida(): string | null {
        return this.medida;
    }
    public setNombre(nombre: string): void {
        this.nombre = nombre;
    }
    public setMedida(medida: string | null): void {
        this.medida = medida;
    }
    public equals(otro: Atributo): boolean {
        return this.id === otro.getId();
    }
}

export enum TipoAtributo {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN'
}
const TIPO_JS: Record<TipoAtributo, 'string' | 'number' | 'boolean'> = {
    [TipoAtributo.STRING]: 'string',
    [TipoAtributo.NUMBER]: 'number',
    [TipoAtributo.BOOLEAN]: 'boolean'
};

export class ValorAtributo {

    private readonly id: string;
    private readonly atributo: Atributo;
    private valor: string | number | boolean;

    constructor(id: string, atributo: Atributo, valor: string | number | boolean) {
        ValorAtributo.validarTipo(atributo, valor);
        this.id = id;
        this.atributo = atributo;
        this.valor = valor;
    }

    public getId(): string {
        return this.id;
    }

    public getAtributo(): Atributo {
        return this.atributo;
    }

    public getValor(): string | number | boolean {
        return this.valor;
    }

    public setValor(valor: string | number | boolean): void {
        ValorAtributo.validarTipo(this.atributo, valor);
        this.valor = valor;
    }

    private static validarTipo(atributo: Atributo, valor: string | number | boolean): void {
        const tipoEsperado = TIPO_JS[atributo.getTipo()];
        if (typeof valor !== tipoEsperado) {
            throw new Error(
                `El atributo "${atributo.getNombre()}" espera un valor ${atributo.getTipo()}, se recibió ${typeof valor}`
            );
        }
    }
}
