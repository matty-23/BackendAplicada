import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Voluntario implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.VER_CALENDARIO,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
    
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
        Permiso.SUSCRIBIRSE_EVENTO,
        Permiso.DESUSCRIBIRSE_EVENTO,
    ]);

    getRol(): string {
            return 'voluntario';
        }
    
    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}