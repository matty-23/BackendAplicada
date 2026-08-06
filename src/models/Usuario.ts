export class Usuario{
    private id: number;
    private nombre: string;
    private apellido: string;
    private correo: string;
    private contraseña: string;
    private departamento:string;

    constructor(id: number, nombre: string, apellido: string, correo: string, contraseña: string,departamento:string) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.contraseña = contraseña;
        this.departamento = departamento;
    }

    getId():number{
        return this.id;
    }
    getNombre():string{
        return this.nombre;
    }
    getApellido():string{
        return this.apellido;
    }
    getNombreCompleto():string{
        return this.nombre + " " + this.apellido;
    }
    getCorreo():string{
        return this.correo;
    }
    getContraseña():string{
        return this.contraseña;
    }
    getDepartamento():string{
        return this.departamento;
    }
    setId(id:number):void{
        this.id = id;
    }
    setNombre(nombre:string):void{
        this.nombre = nombre;
    }
    setApellido(apellido:string):void{
        this.apellido = apellido;
    }
    setCorreo(correo:string):void{
        this.correo = correo;
    }
    setContraseña(contraseña:string):void{
        this.contraseña = contraseña;
    }
    setDepartamento(departamento:string):void{
        this.departamento = departamento;
    }
}