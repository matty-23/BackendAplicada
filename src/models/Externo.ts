import { IRol } from "../interfaces/IRol";
export class Externo implements IRol {
    
    private veEstadisticas: boolean = false;
    private gestionarUsuarios: boolean = false;

    getRol(): string {
        return 'externo';
    }

    VeEstadisticas(): boolean {
        return this.veEstadisticas;
    }
    GestionarUsuarios(): boolean {
        return this.gestionarUsuarios;
    }

}