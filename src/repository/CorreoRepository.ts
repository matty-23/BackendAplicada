import { Resend } from 'resend';
import { Correo } from '../models/Correo';
import { ICorreoRepository } from '../interfaces/ICorreoRepository';

export class CorreoRepository implements ICorreoRepository {

    constructor(private readonly resend:Resend) {}

    async enviar(correo: Correo): Promise<boolean> {
        try {
            const { error } = await this.resend.emails.send({
                from: process.env.EMAIL_EMPRESA!,
                to: correo.getDestinatarios(),
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