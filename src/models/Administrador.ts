import { IRol } from "../interfaces/IRol";
export class Administrador implements IRol{
    private veEstadisticas: boolean = true;
    private gestionarUsuarios: boolean = true;

    getRol(): string {
        return "Administrador";
    }

    VeEstadisticas(): boolean {
        return this.veEstadisticas;
    }

    GestionarUsuarios(): boolean {
        return this.gestionarUsuarios;
    }

}