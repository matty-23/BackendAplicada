import { IRol } from "../../../src/interfaces/IRol";

export class Usuario{
    private id: string;
    private nombre: string;
    private apellido: string;
    private correo: string;
    private contraseña: string;
    private departamento:string;
    public rol:IRol;
    //Definir bien como vamos a manejar roles y permisos; si vamos a hacer una herencia, un string (y muchos if)
    //En la base de datos rol es number
    constructor(id: string, nombre: string, apellido: string, correo: string, contraseña: string,departamento:string, rol: IRol) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.contraseña = contraseña;
        this.departamento = departamento;
        this.rol= rol;
    }

    getId():string{
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
    setId(id:string):void{
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