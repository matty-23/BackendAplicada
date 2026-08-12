import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Visitante implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.VER_CALENDARIO
    ]);

    getRol(): string {
            return 'visitante';
        }
    
    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}