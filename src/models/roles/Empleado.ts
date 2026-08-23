import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Empleado implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.VER_CALENDARIO,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
        Permiso.ELIMINAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
        Permiso.SUSCRIBIRSE_EVENTO,
        Permiso.DESUSCRIBIRSE_EVENTO,
        Permiso.CONFIRMAR_HORAS,
        Permiso.ELIMINAR_HORAS,
        Permiso.MODIFICAR_USUARIO_PROPIO,
    ]);

    getRol(): string {
            return 'empleado';
        }
    
    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}