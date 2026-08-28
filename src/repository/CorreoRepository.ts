import { Resend } from 'resend';
import { Correo } from '../models/Correo';
import { ICorreoRepository } from '../interfaces/ICorreoRepository';
import { Injectable,Inject } from '@nestjs/common';

@Injectable()
export class CorreoRepository implements ICorreoRepository {

    constructor(@Inject('RESEND_CLIENT')private readonly resend:Resend) {}

    async enviar(correo: Correo): Promise<boolean> {
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
}
}