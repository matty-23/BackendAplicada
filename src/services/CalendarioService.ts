import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { ICalendarioService } from '../interfaces/ICalendarioService';

@Injectable()
export class CalendarioService implements ICalendarioService {

    private calendar: calendar_v3.Calendar;
    private calendarId = process.env.GOOGLE_CALENDAR_ID!;

    constructor() {
        const auth = new google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/calendar.events'
            ],
        });

        this.calendar = google.calendar({
            version: 'v3',
            auth,
        });
    }

    private construirDescripcion(evento: Evento, ocurrencia: Ocurrencia,): string {
        const encargado = ocurrencia.getEncargado();
        const participantes = ocurrencia.getParticipantes();
        const encargadoTexto = encargado ? `${encargado.getNombre()} ${encargado.getApellido()}` : 'Sin encargado';
        const participantesTexto = participantes.length > 0 ? participantes.map(p => `${p.getNombre()} ${p.getApellido()}`).join(', ') : 'Sin participantes';
        return `
        Evento: ${evento.getNombre()}
        Estado: ${evento.getEstado()}
        Categoría: ${evento.getCategoria()}
        Tipo de ocurrencia: ${ocurrencia.getTipo()}

        Encargado: ${encargadoTexto}

        Cantidad de personas: ${ocurrencia.getCantidadPersonas()}

        Participantes:${participantesTexto}`.trim();
    }

    // CREAR EVENTO
    async crearEvento(evento: Evento): Promise<void> {
        try {
            const ocurrencias = await evento.getOcurrencias();
            for (const ocurrencia of ocurrencias) {
                const response = await this.calendar.events.insert({
                    calendarId: this.calendarId,
                    requestBody: {
                        summary: evento.getNombre(),
                        description: this.construirDescripcion(evento, ocurrencia,),
                        location: ocurrencia.getLugar(),

                        start: {
                            dateTime: ocurrencia.getFechaInicio().toISOString(),
                            timeZone: 'America/Argentina/Buenos_Aires',
                        },
                        end: {
                            dateTime: ocurrencia.getFechaFinalizacion().toISOString(),
                            timeZone: 'America/Argentina/Buenos_Aires',
                        },
                    },
                });

                console.log(`Evento creado en Google Calendar: ${response.data.id}`);
            }

        } catch (error) {
            console.error('Error creando evento en Google Calendar:', error,);
            throw new Error('No se pudo crear el evento en Google Calendar',);
        }
    }

    // ACTUALIZAR EVENTO
    async actualizarEvento(evento: Evento): Promise<void> {

        try {

            const ocurrencias = await evento.getOcurrencias();

            for (const ocurrencia of ocurrencias) {

                await this.calendar.events.update({

                    calendarId: this.calendarId,
                    eventId: ocurrencia.getIdApiGoogle(),
                    requestBody: {
                        summary: evento.getNombre(),
                        description: this.construirDescripcion(evento, ocurrencia,),
                        location: ocurrencia.getLugar(),
                        start: {
                            dateTime: ocurrencia.getFechaInicio().toISOString(),
                            timeZone: 'America/Argentina/Buenos_Aires',
                        },

                        end: {
                            dateTime: ocurrencia.getFechaFinalizacion().toISOString(),
                            timeZone: 'America/Argentina/Buenos_Aires',
                        },
                    },
                });
            }

        } catch (error) {

            console.error(
                'Error actualizando evento de Google Calendar:',
                error,
            );

            throw new Error(
                'No se pudo actualizar el evento en Google Calendar',
            );
        }
    }

    // ELIMINAR EVENTO
    async eliminarEvento(evento: Evento): Promise<void> {

        try {
            const ocurrencias = await evento.getOcurrencias();
            for (const ocurrencia of ocurrencias) {
                const googleEventId = ocurrencia.getIdApiGoogle();
                if (!googleEventId) {
                    continue;
                }
                await this.calendar.events.delete({ calendarId: this.calendarId, eventId: googleEventId, });

                console.log(`Evento eliminado de Google Calendar: ${googleEventId}`);
            }

        } catch (error) {
            console.error('Error eliminando evento de Google Calendar:', error,);
            throw new Error('No se pudo eliminar el evento de Google Calendar',);
        }
    }
    async crearEventoRecurrentePadre(evento: Evento, rruleStr: string): Promise<string> {
        const ocurrencias = await evento.getOcurrencias();
        const primeraOcurrencia = ocurrencias[0]; // Usada como base para el horario Master

        const requestBody: calendar_v3.Schema$Event = {
            summary: evento.getNombre(),
            location: primeraOcurrencia.getLugar(),
            start: {
                dateTime: primeraOcurrencia.getFechaInicio().toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: primeraOcurrencia.getFechaFinalizacion().toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            recurrence: [rruleStr],
        };

        const response = await this.calendar.events.insert({
            calendarId: this.calendarId,
            requestBody,
        });

        if (!response.data.id) {
            throw new Error('Google Calendar no devolvió un ID para el evento recurrente');
        }

        return response.data.id;
    }
    async modificarEventoPadre(googleEventIdPadre: string, evento: Evento, ocurrenciaBase: Ocurrencia): Promise<void> {
        try {
            const requestBody: calendar_v3.Schema$Event = {
                summary: evento.getNombre(),
                location: ocurrenciaBase.getLugar(),
                start: {
                    dateTime: ocurrenciaBase.getFechaInicio().toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: ocurrenciaBase.getFechaFinalizacion().toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
            };

            // Mantenemos la regla de recurrencia si existe
            const recurrencia = evento.getRecurrencia();
            if (recurrencia && recurrencia !== 'unico') {
                requestBody.recurrence = [recurrencia];
            }

            await this.calendar.events.update({
                calendarId: this.calendarId,
                eventId: googleEventIdPadre,
                requestBody,
            });
        } catch (error) {
            console.error('Error modificando la serie completa en Google Calendar:', error);
            throw new Error('No se pudo modificar la serie de eventos recurrentes');
        }
    }
    // b. modificarInstanciaRecurrente
    async modificarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date, nuevosDatos: Ocurrencia): Promise<void> {
        const instanciaId = await this.obtenerIdInstanciaPorFecha(googleEventIdPadre, fechaOriginal);

        if (instanciaId) {
            await this.calendar.events.patch({
                calendarId: this.calendarId,
                eventId: instanciaId,
                requestBody: {
                    location: nuevosDatos.getLugar(),
                    start: { dateTime: nuevosDatos.getFechaInicio().toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
                    end: { dateTime: nuevosDatos.getFechaFinalizacion().toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
                },
            });
        }
    }

    // c. eliminarExcepcionRecurrente
    async cancelarInstanciaRecurrente(googleEventId: string, fechaOriginal: Date): Promise<void> {
        const instanciaId = await this.obtenerIdInstanciaPorFecha(googleEventId, fechaOriginal);
        if (!instanciaId) {
            throw new Error(`No se encontró la instancia recurrente para ${fechaOriginal.toISOString()}`);
        }
        await this.calendar.events.delete({ calendarId: this.calendarId, eventId: instanciaId, });
    }
async cancelarInstanciaRecurrentePorId(
    idInstanciaGoogle: string
): Promise<void> {

    await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: idInstanciaGoogle,
    });
}
    // Método auxiliar para buscar instancias específicas en la serie
    private async obtenerIdInstanciaPorFecha(googleEventIdPadre: string, fechaOriginal: Date): Promise<string | undefined> {
        // Rango ajustado para encontrar la instancia específica que coincide con la fecha
        const timeMin = new Date(fechaOriginal);
        timeMin.setSeconds(0, 0);
        const timeMax = new Date(fechaOriginal);
        timeMax.setMinutes(timeMax.getMinutes() + 1);

        const response = await this.calendar.events.instances({
            calendarId: this.calendarId,
            eventId: googleEventIdPadre,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 1,
        });

        return response.data.items?.[0]?.id ?? undefined;
    }
}