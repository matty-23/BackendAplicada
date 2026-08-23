import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Becario implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.VER_CALENDARIO,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_USUARIO_PROPIO,
        Permiso.SUSCRIBIRSE_EVENTO,
        Permiso.VER_DETALLES_EVENTOS,
        Permiso.LISTAR_EVENTOS,
        Permiso.AÑADIR_HORAS,
        Permiso.MODIFICAR_HORAS,
        Permiso.VER_BALANCE_HORAS,
        Permiso.VER_REGISTROS_HORAS,
        Permiso.VER_REGISTROS_HORAS_MESES_ANTERIORES,
        Permiso.EXPORTAR_HORAS,
        Permiso.DESUSCRIBIRSE_EVENTO,
    ]);

    getRol(): string {
            return 'becario';
        }
    
    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}