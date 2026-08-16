import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Prisma } from "../generated/prisma/client";
import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { Usuario } from '../models/Usuario';
import { type IEventoRepository } from '../interfaces/IEventoRepository';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository';
import { filtrosEventoDto } from '../DTO/FiltrosDto';

@Injectable()
export class EventoRepository implements IEventoRepository {
    // Constante centralizada para paginación
    private readonly DEFAULT_PAGE_LIMIT = 50;

    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
    ) { }


    //Carga perezosa de Ocurrencias pertenecientes a un Evento
    private async cargarOcurrenciasDeEvento(eventoId: string): Promise<Ocurrencia[]> {
        const ocurrenciasPrisma = await this.prisma.ocurrenciaEvento.findMany({
            where: { idEvento: eventoId },
            include: { usuarioEncargado: true },
            orderBy: { fechaInicio: 'asc' } // Orden cronológico para las ocurrencias, para que cuando se traiga la segunda pagina no te salte eventos
        });

        return Promise.all(
            ocurrenciasPrisma.map(async (oc) => {
                let encargadoModelo: Usuario | undefined = undefined;
                if (oc.usuarioEncargado) {
                    const u = oc.usuarioEncargado;
                    const rol = await this.usuarioRepository.asociarRol(u.rol);
                    // Proyección segura del usuario (sin contraseña sensible)
                    encargadoModelo = new Usuario(u.id, u.nombre, u.apellido, u.correo, '', u.departamento, rol);
                }

                return new Ocurrencia(
                    oc.id,
                    oc.idEvento,
                    oc.fechaInicio,
                    oc.fechaFinalizacion,
                    oc.lugar,
                    oc.cantidadPersonas,
                    encargadoModelo,
                    undefined, // Participantes no cargados aún
                    () => this.cargarParticipantesDeOcurrencia(oc.id) // Loader perezoso
                );
            })
        );
    }

    // Carga perezosa de Participantes pertenecientes a una Ocurrencia
    private async cargarParticipantesDeOcurrencia(ocurrenciaId: string): Promise<Usuario[]> {
        const participantesPrisma = await this.prisma.participante.findMany({
            where: { idOcurrencia: ocurrenciaId },
            include: { usuario: true }
        });

        return Promise.all(
            participantesPrisma.map(async (p) => {
                const u = p.usuario;
                const rol = await this.usuarioRepository.asociarRol(u.rol);
                // Proyección segura del usuario (sin contraseña sensible)
                return new Usuario(u.id, u.nombre, u.apellido, u.correo, '', u.departamento, rol);
            })
        );
    }

    //Convierte un registro de Prisma a Entidad de Dominio sin traer el árbol completo
    private convertirAmodeloLigero(prismaEvent: Prisma.EventoGetPayload<{}>): Evento {
        return new Evento(
            prismaEvent.id,
            prismaEvent.titulo,
            prismaEvent.estado,
            prismaEvent.categoria,
            undefined, // <--- ocurrencias indefinidas
            () => this.cargarOcurrenciasDeEvento(prismaEvent.id) // <--- loader
        );
    }
    private async convertirAmodeloConOcurrencias(
        prismaEvent: Prisma.EventoGetPayload<{
            include: {
                ocurrencias: {
                    include: {
                        usuarioEncargado: true
                    }
                }
            }
        }>
    ): Promise<Evento> {

        const ocurrencias = await Promise.all(
            prismaEvent.ocurrencias.map(async oc => {

                let encargadoModelo: Usuario | undefined = undefined;

                if (oc.usuarioEncargado) {
                    const u = oc.usuarioEncargado;

                    const rol = await this.usuarioRepository.asociarRol(u.rol);

                    encargadoModelo = new Usuario(
                        u.id,
                        u.nombre,
                        u.apellido,
                        u.correo,
                        '',
                        u.departamento,
                        rol
                    );
                }

                return new Ocurrencia(
                    oc.id,
                    oc.idEvento,
                    oc.fechaInicio,
                    oc.fechaFinalizacion,
                    oc.lugar,
                    oc.cantidadPersonas,
                    encargadoModelo,
                    undefined,
                    () => this.cargarParticipantesDeOcurrencia(oc.id)
                );
            })
        );

        return new Evento(
            prismaEvent.id,
            prismaEvent.titulo,
            prismaEvent.estado,
            prismaEvent.categoria,
            ocurrencias
        );
    }
    // =========================================================================
    // MÉTODOS DEL REPOSITORIO
    // =========================================================================

    async getAllEventos(page: number): Promise<Evento[]> {
        const skip = (page - 1) * this.DEFAULT_PAGE_LIMIT;

        const eventosPrisma = await this.prisma.evento.findMany({
            skip,
            take: this.DEFAULT_PAGE_LIMIT,
            orderBy: { createdAt: 'desc' }, // Orden determinista para evitar duplicados en paginación
        });

        return eventosPrisma.map(e => this.convertirAmodeloLigero(e));
    }

    async getActiveEventos(page: number): Promise<Evento[]> {
        const skip = (page - 1) * this.DEFAULT_PAGE_LIMIT;

        const eventosActivos = await this.prisma.evento.findMany({
            where: { estado: 'active' },
            skip,
            take: this.DEFAULT_PAGE_LIMIT,
            orderBy: { createdAt: 'desc' },
        });

        return eventosActivos.map(e => this.convertirAmodeloLigero(e));
    }

    async getEventoById(id: string): Promise<Evento | null> {
        const eventoPrisma = await this.prisma.evento.findUnique({
            where: { id },
        });

        if (!eventoPrisma) return null;
        return this.convertirAmodeloLigero(eventoPrisma);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        const ocurrencias = await evento.getOcurrencias();

        const eventoNuevo = await this.prisma.evento.create({
            data: {
                titulo: evento.getNombre(),
                estado: evento.getEstado(),
                categoria: evento.getCategoria(),
                ocurrencias: {
                    create: ocurrencias.map(oc => ({
                        fechaInicio: oc.getFechaInicio(),
                        fechaFinalizacion: oc.getFechaFinalizacion(),
                        lugar: oc.getLugar() ?? "Sin lugar especificado",
                        cantidadPersonas: oc.getCantidadPersonas(),
                        idEncargado: oc.getEncargado()?.getId() ?? null
                    }))
                }
            }
        });

        return this.convertirAmodeloLigero(eventoNuevo);
    }

    //Actualiza el evento macro con control de excepciones seguro
    async updateEvento(evento: Evento): Promise<boolean> {
        try {
            const resultado = await this.prisma.evento.update({
                where: { id: evento.getId() },
                data: {
                    titulo: evento.getNombre(),
                    estado: evento.getEstado(),
                    categoria: evento.getCategoria(),
                },
            });
            return !!resultado;
        } catch (error) {
            console.error(`Error actualizando el evento con ID ${evento.getId()}:`, error);
            return false;
        }
    }

    // Actualiza los detalles de una ocurrencia específica sin tocar el evento macro
    async updateOcurrencia(ocurrencia: Ocurrencia): Promise<boolean> {
        try {
            const resultado = await this.prisma.ocurrenciaEvento.update({
                where: { id: ocurrencia.getId() },
                data: {
                    fechaInicio: ocurrencia.getFechaInicio(),
                    fechaFinalizacion: ocurrencia.getFechaFinalizacion(),
                    lugar: ocurrencia.getLugar(),
                    cantidadPersonas: ocurrencia.getCantidadPersonas(),
                    idEncargado: ocurrencia.getEncargado()?.getId() ?? null,
                },
            });
            return !!resultado;
        } catch (error) {
            console.error(`Error actualizando la ocurrencia con ID ${ocurrencia.getId()}:`, error);
            return false;
        }
    }

    //Trae exactamente los IDs solicitados sin truncamiento silencioso
    async traerEventosPorIDs(ids: string[]): Promise<Evento[]> {
        if (ids.length === 0) return [];

        const eventosPrisma = await this.prisma.evento.findMany({
            where: { id: { in: ids } },
            orderBy: { createdAt: 'desc' }
        });

        return eventosPrisma.map(e => this.convertirAmodeloLigero(e));
    }

    async deleteEventos(ids: string[]): Promise<boolean> {
        try {
            const resultado = await this.prisma.evento.deleteMany({
                where: { id: { in: ids } },
            });
            return resultado.count > 0;
        } catch (error) {
            console.error('Error eliminando eventos:', error);
            return false;
        }
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        const skip = (filtros.page - 1) * this.DEFAULT_PAGE_LIMIT;

        let usuarioIdsQueCoinciden: string[] = [];

        // 1. Buscar usuarios coincidentes
        if (filtros.busqueda) {
            const usuariosCoincidentes = await this.prisma.usuario.findMany({
                where: {
                    OR: [
                        {
                            nombre: {
                                contains: filtros.busqueda,
                                mode: Prisma.QueryMode.insensitive
                            }
                        },
                        {
                            apellido: {
                                contains: filtros.busqueda,
                                mode: Prisma.QueryMode.insensitive
                            }
                        }
                    ]
                },
                select: { id: true },
                take: 20
            });

            usuarioIdsQueCoinciden = usuariosCoincidentes.map(u => u.id);
        }

        // 2. Armar filtros
        const where: Prisma.EventoWhereInput = {
            ...(filtros.busqueda && {
                OR: [
                    {
                        titulo: {
                            contains: filtros.busqueda,
                            mode: Prisma.QueryMode.insensitive
                        }
                    },
                    ...(usuarioIdsQueCoinciden.length > 0
                        ? [{
                            ocurrencias: {
                                some: {
                                    participantes: {
                                        some: {
                                            usuarioId: {
                                                in: usuarioIdsQueCoinciden
                                            }
                                        }
                                    }
                                }
                            }
                        }]
                        : [])
                ]
            }),

            ...(filtros.categoria && {
                categoria: filtros.categoria
            }),

            ...(filtros.estado && {
                estado: filtros.estado
            }),

            ...(filtros.fechaInicio && {
                ocurrencias: {
                    some: {
                        fechaInicio: {
                            gte: filtros.fechaInicio
                        }
                    }
                }
            }),

            ...(filtros.fechaFin && {
                ocurrencias: {
                    some: {
                        fechaFinalizacion: {
                            lte: filtros.fechaFin
                        }
                    }
                }
            }),

            ...(filtros.participanteId && {
                ocurrencias: {
                    some: {
                        participantes: {
                            some: {
                                usuarioId: filtros.participanteId
                            }
                        }
                    }
                }
            })
        };

        // 3. Traer 50 EVENTOS y sus ocurrencias
        const eventos = await this.prisma.evento.findMany({
            where,
            skip,
            take: this.DEFAULT_PAGE_LIMIT, // <-- 50 EVENTOS
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                ocurrencias: {
                    orderBy: {
                        fechaInicio: 'asc'
                    },
                    include: {
                        usuarioEncargado: true
                    }
                }
            }
        });

        // 4. Convertirlos al modelo
        return Promise.all(
            eventos.map(evento =>
                this.convertirAmodeloConOcurrencias(evento)
            )
        );
    }
}