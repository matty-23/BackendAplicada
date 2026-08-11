import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Externo implements IRol {
    
    private permisos = new Set<Permiso>([
        Permiso.GENERAR_SOLICITUDES,
        Permiso.CANCELAR_SOLICITUDES,
        Permiso.RECIBIR_NOTIFICACIONES,
        Permiso.MODIFICAR_SOLICITUD,
        Permiso.LISTAR_SOLICITUDES,
        Permiso.LISTAR_SOLICITUDES_ACEPTADAS,
        Permiso.MODIFICAR_USUARIO_PROPIO,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
    ]);

    getRol(): string {
        return 'externo';
    }

    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }
}