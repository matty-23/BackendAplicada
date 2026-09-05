
import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { ICalendarioService } from '../interfaces/ICalendarioService';
import { IEventoService } from '../interfaces/IEventoService';
@Injectable()
export class CalendarioService implements ICalendarioService {

    private calendar: calendar_v3.Calendar;
    private calendarId = process.env.GOOGLE_CALENDAR_ID!;

    constructor(
        // 🛠️ La inyección debe ir como parámetro aquí
        @Inject('IEventoRepository') private readonly eventoService: IEventoService,
    ) {
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
    async crearEvento(evento: Evento): Promise<string[]> {
        try {
            const ocurrencias = await evento.getOcurrencias();
            const googleIds: string[] = [];

            for (const ocurrencia of ocurrencias) {
                const response = await this.calendar.events.insert({
                    calendarId: this.calendarId,
                    requestBody: {
                        summary: evento.getNombre(),
                        description: this.construirDescripcion(
                            evento,
                            ocurrencia
                        ),
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

                if (!response.data.id) {
                    throw new Error(
                        'Google Calendar no devolvió un ID para la ocurrencia'
                    );
                }

                googleIds.push(response.data.id);
            }

            return googleIds;

        } catch (error) {
            console.error(
                'Error creando evento en Google Calendar:',
                error
            );

            throw new Error(
                'No se pudo crear el evento en Google Calendar'
            );
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
                if (!googleEventId) continue;

                try {
                    await this.calendar.events.delete({
                        calendarId: this.calendarId,
                        eventId: googleEventId
                    });
                    console.log(`Evento eliminado de Google Calendar: ${googleEventId}`);
                } catch (gError: any) {
                    // Si el error es 404 (No encontrado) o 410 (Ya eliminado), lo perdonamos
                    if (gError.code === 404 || gError.code === 410) {
                        console.warn(`El evento ${googleEventId} ya no existe en Google. Ignorando...`);
                    } else {
                        throw gError; // Si es un error de permisos o red, sí lo lanzamos
                    }
                }
            }
        } catch (error) {
            console.error('Error general eliminando evento de Google Calendar:', error);
            throw new Error('No se pudo eliminar el evento de Google Calendar');
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
                description: this.construirDescripcion(evento, ocurrenciaBase),
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
    // Modificar (1ra vez: Busca y modifica) -> Retorna ID
    async modificarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date, nuevosDatos: Ocurrencia, evento: Evento): Promise<string> {
        const instanciaId = await this.obtenerIdInstanciaPorFecha(googleEventIdPadre, fechaOriginal);
        if (!instanciaId) throw new Error(`No se encontró la instancia recurrente para ${fechaOriginal.toISOString()}`);

        await this.modificarInstanciaRecurrentePorId(instanciaId, nuevosDatos, evento);
        return instanciaId;
    }


    // Modificar Directo (Siguientes veces)
    async modificarInstanciaRecurrentePorId(idInstanciaGoogle: string, nuevosDatos: Ocurrencia, evento: Evento): Promise<void> {
        await this.calendar.events.patch({
            calendarId: this.calendarId,
            eventId: idInstanciaGoogle,
            requestBody: {
                summary: evento.getNombre(),
                description: this.construirDescripcion(evento, nuevosDatos),
                location: nuevosDatos.getLugar(),
                // Al ser una serie recurrente creada con dateTime, estamos obligados a mantener dateTime
                start: {
                    dateTime: nuevosDatos.getFechaInicio().toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                end: {
                    dateTime: nuevosDatos.getFechaFinalizacion().toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
            },
        });
    }

    // Cancelar Directo (Siguientes veces)
    async cancelarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date): Promise<string> {
        const instanciaId = await this.obtenerIdInstanciaPorFecha(
            googleEventIdPadre,
            fechaOriginal
        );

        if (!instanciaId) {
            throw new Error(
                `No se encontró la instancia recurrente para ${fechaOriginal.toISOString()}`
            );
        }

        await this.calendar.events.delete({
            calendarId: this.calendarId,
            eventId: instanciaId,
        });

        return instanciaId;
    }
    async cancelarInstanciaRecurrentePorId(idInstanciaGoogle: string): Promise<void> {
        try {
            await this.calendar.events.delete({
                calendarId: this.calendarId,
                eventId: idInstanciaGoogle,
            });
        } catch (error: any) {
            if (error.code === 404 || error.code === 410) {
                console.warn(`La instancia ${idInstanciaGoogle} ya no existe en Google. Ignorando...`);
            } else {
                throw error;
            }
        }
    }
    // Método auxiliar para buscar instancias específicas en la serie
    private async obtenerIdInstanciaPorFecha(
        googleEventIdPadre: string,
        fechaOriginal: Date
    ): Promise<string | undefined> {
        // Ampliamos el rango de búsqueda a 24hs para evadir desfasajes de TimeZone y All-Day
        const timeMin = new Date(fechaOriginal);
        timeMin.setHours(timeMin.getHours() - 24);

        const timeMax = new Date(fechaOriginal);
        timeMax.setHours(timeMax.getHours() + 24);

        const response = await this.calendar.events.instances({
            calendarId: this.calendarId,
            eventId: googleEventIdPadre,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 50,
        });

        const instancia = response.data.items?.find(item => {
            // Soporta tanto eventos con hora (dateTime) como eventos Todo el Día (date)
            const startStr = item.start?.dateTime || item.start?.date;
            if (!startStr) return false;

            const fechaInstancia = new Date(startStr);

            // Si cae en la misma ventana de 24 horas, es nuestra instancia
            return Math.abs(fechaInstancia.getTime() - fechaOriginal.getTime()) <= 24 * 60 * 60 * 1000;
        });

        return instancia?.id ?? undefined;
    }
}