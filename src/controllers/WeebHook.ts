/*import { Controller, Headers, Param, Post, Body, Inject, Patch, Put, UseGuards, Delete, Query, Res, Req, } from '@nestjs/common';
import { CalendarioService } from '../services/CalendarioService.js';
@Controller('api/webhooks')
export class WebhookController {
    constructor(private readonly calendarioService: CalendarioService) {}

    @Post('google-calendar')
    async recibirNotificacionGoogle(@Headers() headers: any, @Req() req: Request) {
        // Google envía el ID del canal y el estado en los headers
        const estado = headers['x-goog-resource-state']; // puede ser 'sync' o 'exists'
        
        if (estado === 'exists') {
            // "exists" significa que algo se creó, actualizó o borró.
            // Disparamos la sincronización en segundo plano para no bloquear a Google
            this.calendarioService.sincronizarDesdeGoogle();
        }

        return { ok: true }; // Siempre hay que responderle rápido a Google con un 200 OK
    }
}*/