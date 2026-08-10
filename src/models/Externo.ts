import { IRol } from "../interfaces/IRol";
export class Externo implements IRol {
    
    private veEstadisticas: boolean = false;
    private gestionarUsuarios: boolean = false;
    private generarSolicitudes: boolean = true;
    private cancelarSolicitudes: boolean= true;
    private recibirNotificaciones: boolean=true;
    private aceptarSolicitud: boolean=false;
    private rechazarSolicitud:boolean=false;
    private modificarSolicitud:boolean=true;

    getRol(): string {
        return 'externo';
    }

    VeEstadisticas(): boolean {
        return this.veEstadisticas;
    }
    GestionarUsuarios(): boolean {
        return this.gestionarUsuarios;
    }

    GenerarSolicitudes():boolean{
        return this.generarSolicitudes;
    }

    CancelarSolicitudes(): boolean{
        return this.cancelarSolicitudes;
    }

    RecibirNotificaciones(): boolean{
        return this.recibirNotificaciones;
    }

    CambiarRecibirNotificaciones(estado:boolean):boolean{
        this.recibirNotificaciones=estado;
        return this.recibirNotificaciones
    }
    AceptarSolicitud():boolean{
        return this.aceptarSolicitud
    }
    RechazarSolicitud():boolean{
        return this.rechazarSolicitud
    }
    ModificarSolicitud(estado:string,fechaInicio:Date):boolean{
        const fechaActual=new Date();
        //12 horas. Revisar con el cliente si esta de acuerdo.
        const fechaLimite = fechaInicio.getTime() - (12 * 60 * 60 * 1000);

        if(estado==='aceptada' ||  fechaLimite < fechaActual.getTime()){
            return false;
        }

        return this.modificarSolicitud;

    }

}