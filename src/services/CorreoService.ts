 import { CorreoConfirmacionCuentaDTO, CorreoDTO, CorreoRecuperacionContrasenaDTO } from "../DTO/CorreoDTO";
import { ICorreoRepository } from "../interfaces/ICorreoRepository";
import { ICorreoService } from "../interfaces/ICorreoService";
import { PrioridadCorreo } from "../DTO/CorreoDTO";
import { Correo} from "../models/Correo";

export class CorreoService implements ICorreoService {
    constructor(private readonly correoRepository: ICorreoRepository){}

    async enviarCorreo(data: CorreoDTO): Promise<boolean> {

        let headers: Record<string, string> = {};
        
        if (data.prioridad === PrioridadCorreo.ALTA) {
            headers = {
                'X-Priority': '1 (Highest)',
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
            };
        } else if (data.prioridad === PrioridadCorreo.BAJA) {
            headers = {
                'X-Priority': '5 (Lowest)',
                'X-MSMail-Priority': 'Low',
                'Importance': 'low',
            };
        }

        const attachments = data.archivosAdjuntos?.map(archivo => ({
            filename: archivo.filename,
            content: archivo.content 
        }));

        const payload=Correo = {
            //from: 'App Aplicada <onboarding@resend.dev>', En prod, usar variables de entorno
            id:"0", //Le pasamos un id cualquiera  
            destinatarios: [data.destinatario],
            asunto: data.asunto || 'Notificación del sistema',
            mensajeHtml: data.mensajeHtml || '<p>Tenés una nueva notificación</p>'
        };

        // Añadimos propiedades opcionales solo si tienen contenido
        if (Object.keys(headers).length > 0) payload.headers = headers;
        if (attachments && attachments.length > 0) payload.archivosAdjuntos = attachments;

        // 4. Delegar al repositorio
        return await this.correoRepository.enviar(payload);
    }

    async enviarCorreoConfirmacionCuenta(correo: CorreoConfirmacionCuentaDTO): Promise<boolean> {
        // Implementación para enviar correo de confirmación de cuenta
        return true;
    }

    async enviarCorreoRecuperacionContrasena(correo: CorreoRecuperacionContrasenaDTO): Promise<boolean> {
        // Implementación para enviar correo de recuperación de contraseña
        return true;
    }

    async enviarCorreoNotificaciones(correo: CorreoDTO): Promise<boolean> {
        // Implementación para enviar correos de notificación
        return true;
    }
}