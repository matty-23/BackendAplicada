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
        Permiso.AÑADIR_HORAS,
        Permiso.MODIFICAR_HORAS,
        Permiso.ELIMINAR_HORAS,
        Permiso.CONFIRMAR_HORAS,
        Permiso.VER_REGISTROS_HORAS,
        Permiso.VER_REGISTROS_HORAS_MESES_ANTERIORES,
        Permiso.ASIGNAR_EQUIPO_EVENTO,
        Permiso.LISTAR_EQUIPO,
        Permiso.REGISTRAR_EQUIPO,
        Permiso.MODIFICAR_EQUIPO,
        Permiso.ELIMINAR_EQUIPO,
        Permiso.TRANSFERIR_EQUIPO,
        Permiso.VER_BALANCE_HORAS,
        Permiso.EXPORTAR_HORAS,
        Permiso.LISTAR_AUDITORIAS,
        Permiso.GENERAR_REPORTES,
        Permiso.EXPORTAR_REPORTES,
        Permiso.LISTAR_USUARIOS,
        Permiso.LISTAR_PLANILLAS,
        Permiso.REGISTRAR_PLANILLAS,
        Permiso.MODIFICAR_PLANILLAS,
        Permiso.ELIMINAR_PLANILLAS,
        Permiso.DESUSCRIBIRSE_EVENTO,
        Permiso.MODIFICAR_ROL,
    ]);

    getRol(): string {
        return 'administrador';
    }

    tienePermiso(permiso: Permiso): boolean {
        return this.permisos.has(permiso);
    }

}