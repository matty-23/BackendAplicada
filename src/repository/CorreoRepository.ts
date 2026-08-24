import { Resend } from 'resend';
import { Correo } from '../models/Correo';
import { ICorreoRepository } from '../interfaces/ICorreoRepository';

export class CorreoRepository implements ICorreoRepository {
    private readonly resend: Resend;

    constructor() {}

    async enviar(correo: Correo): Promise<boolean> {
        try {
            const { error } = await this.resend.emails.send({
                from: correo.getDestinatario(),
                to: correo.getDestinatario(),
                subject: correo.getAsunto(),
                html: correo.getMensajeHtml(),
                headers: correo.getHeaders(),
                attachments: correo.getArchivosAdjuntos()
            });

            if (error) return false;
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}