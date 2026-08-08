import { IRol } from "../interfaces/IRol";
export class Invitado implements IRol {
    
    private veEstadisticas: boolean = false;
    private gestionarUsuarios: boolean = false;

    getRol(): string {
        return 'invitado';
    }

    VeEstadisticas(): boolean {
        return this.veEstadisticas;
    }
    GestionarUsuarios(): boolean {
        return this.gestionarUsuarios;
    }

}