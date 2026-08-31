import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { Prisma } from '../generated/prisma/client';

import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { Usuario } from '../models/Usuario';

import { type IEventoRepository } from '../interfaces/IEventoRepository';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository';

import { filtrosEventoDto } from '../DTO/FiltrosDto';


// TIPO DEL EVENTO COMPLETO
type EventoCompleto = Prisma.EventoGetPayload<{
    include: {
        ocurrencias_evento: {
            include: {
                participante: true;
            };
        };
    };
}>;


@Injectable()
export class EventoRepository implements IEventoRepository {

    private readonly DEFAULT_PAGE_LIMIT = 50;

    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,

        @Inject('IUsuarioRepository')
        private readonly usuarioRepository: IUsuarioRepository,
    ) { }


    // USUARIOS

    private async convertirUsuario(
        prismaUser: Prisma.UserGetPayload<{}>,): Promise<Usuario> {

        const rol =
            await this.usuarioRepository.asociarRol(
                prismaUser.rol,
            );

        return new Usuario(
            prismaUser.id,
            prismaUser.name,
            prismaUser.apellido,
            prismaUser.email,
            '',
            prismaUser.departamento,
            rol,
        );
    }

async guardarGoogleEventId(idOcurrencia: string,googleEventId: string): Promise<void> {

    await this.prisma.ocurrencias_evento.update({
        where: {
            id: idOcurrencia,
        },
        data: {
            google_event_id: googleEventId,
        },
    });
}
    private async convertirUsuarios(
        usuarios: Prisma.UserGetPayload<{}>[],): Promise<Map<string, Usuario>> {

        const mapa = new Map<string, Usuario>();

        if (usuarios.length === 0) {
            return mapa;
        }

        const usuariosUnicos =
            new Map<string, Prisma.UserGetPayload<{}>>();

        for (const usuario of usuarios) {
            usuariosUnicos.set(
                usuario.id, usuario,
            );
        }

        const usuariosConvertidos =
            await Promise.all(
                Array.from(usuariosUnicos.values(),).map(usuario =>
                    this.convertirUsuario(usuario),),
            );

        for (const usuario of usuariosConvertidos) {
            mapa.set(
                usuario.getId(), usuario,
            );
        }

        return mapa;
    }


    // CONVERSIÓN DE EVENTOS COMPLETOS
    private async convertirEventosCompletos(
        eventosPrisma: EventoCompleto[],
    ): Promise<Evento[]> {

        if (eventosPrisma.length === 0) {
            return [];
        }

        // IDs de todos los usuarios necesarios
        const idsUsuarios = new Set<string>();

        for (const evento of eventosPrisma) {

            for (const ocurrencia of evento.ocurrencias_evento) {

                // Encargado
                if (ocurrencia.id_encargado) {
                    idsUsuarios.add(ocurrencia.id_encargado);
                }

                // Participantes
                for (const participante of ocurrencia.participante) {
                    idsUsuarios.add(participante.usuarioId);
                }
            }
        }

        // Traer todos los usuarios en una sola consulta
        const usuariosPrisma =
            idsUsuarios.size > 0
                ? await this.prisma.user.findMany({
                    where: {
                        id: {
                            in: Array.from(idsUsuarios),
                        },
                    },
                })
                : [];

        // Convertir usuarios
        const usuariosMapa =
            await this.convertirUsuarios(usuariosPrisma);

        // Construir entidades
        return eventosPrisma.map(eventoPrisma => {

            const ocurrencias = eventoPrisma.ocurrencias_evento.map(
                ocurrenciaPrisma => {

                    let encargado: Usuario | undefined;

                    if (ocurrenciaPrisma.id_encargado) {
                        encargado = usuariosMapa.get(
                            ocurrenciaPrisma.id_encargado,
                        );
                    }

                    const participantes: Usuario[] =
                        ocurrenciaPrisma.participante
                            .map(participante =>
                                usuariosMapa.get(participante.usuarioId),
                            )
                            .filter(
                                (usuario): usuario is Usuario =>
                                    usuario !== undefined,
                            );

                    return new Ocurrencia(
                        ocurrenciaPrisma.id,
                        ocurrenciaPrisma.id_evento,
                        ocurrenciaPrisma.fecha_inicio,
                        ocurrenciaPrisma.fecha_finalizacion,
                        ocurrenciaPrisma.tipo ?? "normal",
                        false,
                        ocurrenciaPrisma.lugar,
                        ocurrenciaPrisma.cantidad_personas,
                        encargado,
                        participantes,
                    );
                },
            );

            return new Evento(
                eventoPrisma.id,
                eventoPrisma.titulo,
                eventoPrisma.estado,
                eventoPrisma.categoria,
                eventoPrisma.color ?? "#B2FFFF",
                eventoPrisma.recurrencia ?? undefined,
                ocurrencias,
            );
        });
    }
    // GET ALL
    async getAllEventos(page: number): Promise<Evento[]> {

        const pagina = Math.max(page, 1);

        const skip =
            (pagina - 1) * this.DEFAULT_PAGE_LIMIT;

        const eventos =
            await this.prisma.evento.findMany({
                skip,

                take: this.DEFAULT_PAGE_LIMIT,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    ocurrencias_evento: {
                        orderBy: { fecha_inicio: 'asc', },

                        include: { participante: true, },
                    },
                },
            });

        return this.convertirEventosCompletos(eventos);
    }

    // GET BY ID
    async getEventoById(id: string): Promise<Evento | null> {

        const evento = await this.prisma.evento.findUnique({
            where: {
                id,
            },

            include: {
                ocurrencias_evento: {
                    orderBy: {
                        fecha_inicio: 'asc',
                    },

                    include: {
                        participante: true,
                    },
                },
            },
        });

        if (!evento) {
            return null;
        }

        const eventos =
            await this.convertirEventosCompletos([evento]);

        return eventos[0] ?? null;
    }

    // CREAR EVENTO
    async addEvento(evento: Evento): Promise<Evento> {
        const ocurrencias = await evento.getOcurrencias();

        const eventoCreado = await this.prisma.evento.create({
            data: {
                titulo: evento.getNombre(), estado: evento.getEstado(), categoria: evento.getCategoria(), color: evento.getColor() ?? null, recurrencia: evento.getRecurrencia(), ocurrencias_evento: {
                    create: ocurrencias.map(ocurrencia => ({
                        fecha_inicio:
                            ocurrencia.getFechaInicio(),

                        fecha_finalizacion:
                            ocurrencia.getFechaFinalizacion(),

                        lugar:
                            ocurrencia.getLugar()
                            ?? 'Sin lugar especificado',

                        cantidad_personas:
                            ocurrencia.getCantidadPersonas(),

                        tipo:
                            ocurrencia.getTipo(),

                        id_encargado:
                            ocurrencia.getEncargado()?.getId()
                            ?? null,

                        participante: {
                            create:
                                ocurrencia
                                    .getParticipantes()
                                    .map(participante => ({
                                        usuarioId:
                                            participante.getId(),
                                    })),
                        },
                    })),
                },
            },
        });
        const eventoCompleto = await this.getEventoById(eventoCreado.id);
        if (!eventoCompleto) {
            throw new Error(`No se pudo recuperar el evento creado ${eventoCreado.id}`,);
        }
        return eventoCompleto;
    }

    // ACTUALIZAR EVENTO
    async updateEvento(evento: Evento): Promise<boolean> {
        try {
            await this.prisma.evento.update({
                where: {
                    id: evento.getId(),
                }, data: {
                    titulo: evento.getNombre(), estado: evento.getEstado(), categoria: evento.getCategoria(), color: evento.getColor() ?? null, recurrencia: evento.getRecurrencia(),
                },
            });
            return true;
        } catch (error) {
            console.error(`Error actualizando el evento ${evento.getId()}:`, error,);
            return false;
        }
    }

    // ACTUALIZAR OCURRENCIA
    async updateOcurrencia(ocurrencia: Ocurrencia,): Promise<boolean> {
        try {
            await this.prisma.ocurrencias_evento.update({
                where: { id: ocurrencia.getId(), }, data: {
                    fecha_inicio: ocurrencia.getFechaInicio(), fecha_finalizacion: ocurrencia.getFechaFinalizacion(), lugar: ocurrencia.getLugar(), cantidad_personas: ocurrencia.getCantidadPersonas(), id_encargado: ocurrencia.getEncargado()?.getId() ?? null, tipo: ocurrencia.getTipo(), participante: {
                        deleteMany: {}, create: ocurrencia.getParticipantes().map(participante => ({ usuarioId: participante.getId(), })),
                    },
                },
            });
            return true;
        } catch (error) {
            console.error(`Error actualizando ocurrencia ${ocurrencia.getId()}:`, error,);
            return false;
        }
    }

    // TRAER EVENTOS POR IDS
    async traerEventosPorIDs(
        ids: string[],): Promise<Evento[]> {

        if (ids.length === 0) {
            return [];
        }

        const eventos = await this.prisma.evento.findMany({
            where: {
                id: {
                    in: ids,
                },
            },

            orderBy: {
                createdAt: 'desc',
            },

            include: {
                ocurrencias_evento: {
                    orderBy: {
                        fecha_inicio: 'asc',
                    },

                    include: {
                        participante: true,
                    },
                },
            },
        });

        return this.convertirEventosCompletos(eventos);
    }

    // DELETE
    async deleteEventos(ids: string[]): Promise<boolean> {
        if (ids.length === 0) {
            return false;
        }
        try {
            const resultado = await this.prisma.evento.deleteMany({
                where: { id: { in: ids, }, },
            });
            return resultado.count > 0;

        } catch (error) {
            console.error(
                'Error eliminando eventos:', error,
            );
            return false;
        }
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        const pagina = Math.max(filtros.page ?? 1, 1);
        const skip = (pagina - 1) * this.DEFAULT_PAGE_LIMIT;

        const where: Prisma.EventoWhereInput = {};

        if (filtros.estado) {
            where.estado = filtros.estado;
        }

        if (filtros.categoria) {
            where.categoria = filtros.categoria;
        }

        if (filtros.busqueda?.trim()) {
            const busqueda = filtros.busqueda.trim();

            const usuariosCoincidentes = await this.prisma.user.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: busqueda,
                                mode: Prisma.QueryMode.insensitive,
                            },
                        },
                        {
                            apellido: {
                                contains: busqueda,
                                mode: Prisma.QueryMode.insensitive,
                            },
                        },
                        {
                            email: {
                                contains: busqueda,
                                mode: Prisma.QueryMode.insensitive,
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                },
                take: 50,
            });

            const idsUsuarios = usuariosCoincidentes.map(usuario => usuario.id);

            where.OR = [
                {
                    titulo: {
                        contains: busqueda,
                        mode: Prisma.QueryMode.insensitive,
                    },
                },
                ...(idsUsuarios.length > 0
                    ? [
                        {
                            ocurrencias_evento: {
                                some: {
                                    OR: [
                                        {
                                            id_encargado: {
                                                in: idsUsuarios,
                                            },
                                        },
                                        {
                                            participante: {
                                                some: {
                                                    usuarioId: {
                                                        in: idsUsuarios,
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ]
                    : []),
            ];
        }

        const condicionesOcurrencias: Prisma.ocurrencias_eventoWhereInput[] = [];

        if (filtros.participanteId) {
            condicionesOcurrencias.push({
                participante: {
                    some: {
                        usuarioId: filtros.participanteId,
                    },
                },
            });
        }

        if (filtros.encargadoId) {
            condicionesOcurrencias.push({
                id_encargado: filtros.encargadoId,
            });
        }

        let filtroFecha: Prisma.ocurrencias_eventoWhereInput | undefined;

        if (filtros.fechaInicio && filtros.fechaFin) {
            filtroFecha = {
                AND: [
                    {
                        fecha_inicio: {
                            lte: filtros.fechaFin,
                        },
                    },
                    {
                        fecha_finalizacion: {
                            gte: filtros.fechaInicio,
                        },
                    },
                ],
            };
        } else if (filtros.fechaInicio) {
            const inicio = new Date(filtros.fechaInicio);
            const fin = new Date(filtros.fechaInicio);

            fin.setHours(23, 59, 59, 999);

            filtroFecha = {
                AND: [
                    {
                        fecha_inicio: {
                            lte: fin,
                        },
                    },
                    {
                        fecha_finalizacion: {
                            gte: inicio,
                        },
                    },
                ],
            };
        } else if (filtros.fechaFin) {
            const inicio = new Date(filtros.fechaFin);
            const fin = new Date(filtros.fechaFin);

            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);

            filtroFecha = {
                AND: [
                    {
                        fecha_inicio: {
                            lte: fin,
                        },
                    },
                    {
                        fecha_finalizacion: {
                            gte: inicio,
                        },
                    },
                ],
            };
        }

        if (filtroFecha) {
            condicionesOcurrencias.push(filtroFecha);
        }

        if (condicionesOcurrencias.length > 0) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : []),
                ...condicionesOcurrencias.map(condicion => ({
                    ocurrencias_evento: {
                        some: condicion,
                    },
                })),
            ];
        }

        const eventos = await this.prisma.evento.findMany({
            where,
            skip,
            take: this.DEFAULT_PAGE_LIMIT,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                ocurrencias_evento: {
                    orderBy: {
                        fecha_inicio: 'asc',
                    },
                    include: {
                        participante: true,
                    },
                },
            },
        });

        return this.convertirEventosCompletos(eventos);
    }
}