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

    // =========================================================================
    // MÉTODOS PRIVADOS DE CONVERSIÓN (Usuario Prisma → Modelo de Dominio)
    // =========================================================================

    /**
     * Convierte un User de Prisma al modelo de dominio Usuario
     * Proyección segura (sin contraseña)
     */
    private async convertirPrismaUserAModelo(prismaUser: Prisma.UserGetPayload<{}>): Promise<Usuario> {
        const rol = await this.usuarioRepository.asociarRol(prismaUser.rol);
        return new Usuario(
            prismaUser.id,
            prismaUser.name,
            prismaUser.apellido,
            prismaUser.email,
            '', // Contraseña vacía (no se devuelve nunca)
            prismaUser.departamento,
            rol
        );
    }

    //Carga perezosa de Ocurrencias pertenecientes a un Evento
    private async cargarOcurrenciasDeEvento(eventoId: string): Promise<Ocurrencia[]> {
        const ocurrenciasPrisma = await this.prisma.ocurrencias_evento.findMany({
            where: { id_evento: eventoId },
            include: {
                // Cambio: referencias a 'User' en lugar de 'usuario'
                eventos: true
            },
            orderBy: { fecha_inicio: 'asc' } // Orden cronológico
        });

        return Promise.all(
            ocurrenciasPrisma.map(async (oc) => {
                // Nota: La tabla ocurrencias_evento tiene id_encargado pero no carga el usuario
                // Deberías hacer un include adicional si necesitas los datos del encargado
                const ocurrenciaPrismaConEncargado = await this.prisma.ocurrencias_evento.findUnique({
                    where: { id: oc.id },
                    include: {
                        // Aquí va la relación al encargado si existe en el schema
                        // Por ahora, basándome en el schema, parece que solo hay id_encargado
                    }
                });

                let encargadoModelo: Usuario | undefined = undefined;
                // Si tienes relación explícita en Prisma, úsala:
                // if (oc.usuarioEncargado) {
                //     encargadoModelo = await this.convertirPrismaUserAModelo(oc.usuarioEncargado);
                // }

                return new Ocurrencia(
                    oc.id,
                    oc.id_evento,
                    oc.fecha_inicio,
                    oc.fecha_finalizacion,
                    oc.lugar,
                    oc.cantidad_personas,
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
            where: { id_ocurrencia: ocurrenciaId },
            include: {
                // Aquí necesitas la relación al User
                // Basándome en el schema, Participante solo tiene usuarioId pero no relación explícita
            }
        });

        return Promise.all(
            participantesPrisma.map(async (p) => {
                // Necesitas hacer un query adicional al User
                const prismaUser = await this.prisma.user.findUnique({
                    where: { id: p.usuarioId }
                });

                if (!prismaUser) {
                    throw new Error(`Usuario no encontrado: ${p.usuarioId}`);
                }

                return this.convertirPrismaUserAModelo(prismaUser);
            })
        );
    }

    // =========================================================================
    // MÉTODOS DE CONVERSIÓN A MODELO (Evento)
    // =========================================================================

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
                ocurrencias_evento: {
                    include: {
                        // Aquí va la relación al encargado si existe
                    }
                }
            }
        }>
    ): Promise<Evento> {

        const ocurrencias = await Promise.all(
            prismaEvent.ocurrencias_evento.map(async (oc) => {
                let encargadoModelo: Usuario | undefined = undefined;

                // Si el encargado existe, cárgalo desde User
                if (oc.id_encargado) {
                    const prismaUser = await this.prisma.user.findUnique({
                        where: { id: oc.id_encargado }
                    });

                    if (prismaUser) {
                        encargadoModelo = await this.convertirPrismaUserAModelo(prismaUser);
                    }
                }

                return new Ocurrencia(
                    oc.id,
                    oc.id_evento,
                    oc.fecha_inicio,
                    oc.fecha_finalizacion,
                    oc.lugar,
                    oc.cantidad_personas,
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
                titulo: evento.getNombre(),  // ← Este debe estar
                estado: evento.getEstado(),
                categoria: evento.getCategoria(),
                ocurrencias_evento: {
                    create: ocurrencias.map(oc => ({
                        fecha_inicio: oc.getFechaInicio(),
                        fecha_finalizacion: oc.getFechaFinalizacion(),
                        lugar: oc.getLugar() ?? "Sin lugar especificado",
                        cantidad_personas: oc.getCantidadPersonas(),
                        id_encargado: oc.getEncargado()?.getId() ?? null
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
            const resultado = await this.prisma.ocurrencias_evento.update({
                where: { id: ocurrencia.getId() },
                data: {
                    fecha_inicio: ocurrencia.getFechaInicio(),
                    fecha_finalizacion: ocurrencia.getFechaFinalizacion(),
                    lugar: ocurrencia.getLugar(),
                    cantidad_personas: ocurrencia.getCantidadPersonas(),
                    id_encargado: ocurrencia.getEncargado()?.getId() ?? null,
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
        const usuariosCoincidentes = await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
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

    // 2. PREPARAR FECHAS CORRECTAMENTE
    let filtroFechas: Prisma.ocurrencias_eventoWhereInput | undefined = undefined;

    if (filtros.fechaInicio && filtros.fechaFin) {
        // ✅ Caso 1: Ambas fechas - buscar solapamiento
        // Ocurrencia se solapa con el rango si:
        // - Ocurrencia comienza ANTES de que termine el rango
        // - Ocurrencia termina DESPUÉS de que comience el rango
        filtroFechas = {
            AND: [
                { fecha_inicio: { lte: filtros.fechaFin } },
                { fecha_finalizacion: { gte: filtros.fechaInicio } }
            ]
        };
    } else if (filtros.fechaInicio && !filtros.fechaFin) {
        // ✅ Caso 2: Solo fecha inicio - buscar ocurrencias que caen en ese día
        const finDelDia = new Date(filtros.fechaInicio);
        finDelDia.setHours(23, 59, 59, 999);

        filtroFechas = {
            AND: [
                { fecha_inicio: { lte: finDelDia } },
                { fecha_finalizacion: { gte: filtros.fechaInicio } }
            ]
        };
    } else if (!filtros.fechaInicio && filtros.fechaFin) {
        // ✅ Caso 3: Solo fecha fin (menos común, pero cubrimos)
        const inicioDelDia = new Date(filtros.fechaFin);
        inicioDelDia.setHours(0, 0, 0, 0);

        filtroFechas = {
            AND: [
                { fecha_inicio: { lte: filtros.fechaFin } },
                { fecha_finalizacion: { gte: inicioDelDia } }
            ]
        };
    }

    // 3. Armar filtros
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
                        ocurrencias_evento: {
                            some: {
                                participante: {
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

        // ✅ Filtro de fechas unificado y correcto
        ...(filtroFechas && {
            ocurrencias_evento: {
                some: filtroFechas
            }
        }),

        ...(filtros.participanteId && {
            ocurrencias_evento: {
                some: {
                    participante: {
                        some: {
                            usuarioId: filtros.participanteId
                        }
                    }
                }
            }
        })
    };

    // 4. Traer eventos
    const eventos = await this.prisma.evento.findMany({
        where,
        skip,
        
        take: this.DEFAULT_PAGE_LIMIT,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            ocurrencias_evento: {
                orderBy: {
                    fecha_inicio: 'asc'
                }
            }
        }
    });

    // 5. Convertirlos al modelo
    return Promise.all(
        eventos.map(evento =>
            this.convertirAmodeloConOcurrencias(evento)
        )
    );
}
}