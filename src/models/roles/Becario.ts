import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Becario implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.VER_CALENDARIO,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
        Permiso.SUSCRIBIRSE_EVENTO,
        Permiso.VER_DETALLES_EVENTOS,
        Permiso.LISTAR_EVENTOS,
    ]);

    getRol(): string {
            return 'externo';
        }
    
    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}