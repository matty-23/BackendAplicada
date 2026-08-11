import { IRol } from "../../interfaces/IRol";
import { Permiso } from "./Permisos";

export class Administrador implements IRol {

    private permisos = new Set<Permiso>([
        Permiso.VER_ESTADISTICAS,
        Permiso.AÑADIR_USUARIO,
        Permiso.ELIMINAR_USUARIO,
        Permiso.MODIFICAR_USUARIO,
        Permiso.MODIFICAR_USUARIO_PROPIO,
        Permiso.GENERAR_SOLICITUDES,
        Permiso.CANCELAR_SOLICITUDES,
        Permiso.RECIBIR_NOTIFICACIONES,
        Permiso.ACEPTAR_SOLICITUD,
        Permiso.RECHAZAR_SOLICITUD,
        Permiso.MODIFICAR_SOLICITUD,
        Permiso.MODIFICAR_SOLICITUD_ACEPTADA,
        Permiso.LISTAR_SOLICITUDES,
        Permiso.LISTAR_SOLICITUDES_ACEPTADAS,
        Permiso.VER_CALENDARIO,
        Permiso.VER_DETALLES_EVENTOS,
        Permiso.LISTAR_EVENTOS,
        Permiso.AÑADIR_EVENTOS,
        Permiso.ELIMINAR_EVENTOS,
        Permiso.MODIFICAR_EVENTOS,
        Permiso.DEJAR_COMENTARIOS_EVENTOS,
        Permiso.ELIMINAR_COMENTARIOS_EVENTOS,
        Permiso.MODIFICAR_COMENTARIOS_EVENTOS,
        Permiso.SUSCRIBIRSE_EVENTO,
    ]);

    getRol(): string {
        return 'externo';
    }

    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}