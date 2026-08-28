import { CorreoConfirmacionCuentaDTO, CorreoDTO, CorreoRecuperacionContrasenaDTO } from "../DTO/CorreoDTO";
import { ICorreoRepository } from "../interfaces/ICorreoRepository";
import { ICorreoService } from "../interfaces/ICorreoService";
import { PrioridadCorreo } from "../DTO/CorreoDTO";
import { Correo } from "../models/Correo";
import { HttpException, Injectable, InternalServerErrorException,Inject } from "@nestjs/common";

@Injectable()
export class CorreoService implements ICorreoService {
    constructor(@Inject('ICorreoRepository') private readonly correoRepository: ICorreoRepository) { }

    async enviarCorreo(data: CorreoDTO): Promise<boolean> {

        let headers: Record<string, string> = {};
        try {
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

            const correo = new Correo(
                "0", //Le pasamos un id cualquiera  
                data.destinatarios,
                data.asunto || ' ',
                data.mensajeHtml || " ",
                headers,
                attachments
            );


            return await this.correoRepository.enviar(correo);
        }
        catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException({ message: "Error interno" });
        }
    }

    async enviarCorreoConfirmacionCuenta(data: CorreoConfirmacionCuentaDTO): Promise<boolean> {
        try {
            const headers = {
                'X-Priority': '1 (Highest)',
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
            };
            const notificación = new Correo(
                "0",
                [data.destinatario],
                data.asunto,
                data.mensajeConfirmacion,
                headers
            );

            return this.correoRepository.enviar(notificación);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException({ message: "Error interno" });
        }

    }

    async enviarCorreoNotificaciones(correo: CorreoDTO): Promise<boolean> {
        try {
            const headers = {
                'X-Priority': '5 (Lowest)',
                'X-MSMail-Priority': 'Low',
                'Importance': 'low',
            };

            const notificación = new Correo(
                "0",
                correo.destinatarios,
                correo.asunto ?? "",
                correo.mensajeHtml ?? "",
                headers
            );
            return await this.correoRepository.enviar(notificación);
        }
        catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException({ message: "Error interno" });
        }
    }
}