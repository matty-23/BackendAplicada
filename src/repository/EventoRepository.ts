// repository/EventoRepository.ts
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Evento as PrismaEvento, Prisma, Usuario as PrismaUsuario } from "../generated/prisma/client";
import { Evento } from '../models/Evento';
import { EstadoEvento } from '../models/Evento';
import { type IEventoRepository } from '../interfaces/IEventoRepository';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository';
import { filtrosEventoDto } from '../DTO/FiltrosDto';
import { Usuario } from '../models/Usuario';

// Definimos el tipo esperado cuando Prisma hace el JOIN de Participantes y Usuarios
type PrismaEventoConParticipantes = PrismaEvento & {
    participantes?: { usuario: PrismaUsuario }[];
};

@Injectable()
export class EventoRepository implements IEventoRepository {
    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
    ) { }

    // Helper para reutilizar el JOIN de Prisma en todos los queries
    private get includeParticipantes() {
        return {
            participantes: {
                include: {
                    usuario: true
                }
            }
        };
    }

    private async convertirAmodelo(prismaEvent: PrismaEventoConParticipantes): Promise<Evento> {
        const evento = new Evento(
            prismaEvent.id,
            prismaEvent.titulo,
            prismaEvent.fechaInicio,
            prismaEvent.fechaFinalizacion,
            prismaEvent.cantidadPersonas,
            prismaEvent.lugar,
            prismaEvent.estado as EstadoEvento, // Prisma retorna string; TypeScript valida contra el union type
            prismaEvent.categoria
        );

        if (prismaEvent.operariosEncargado) {
            const encargado = await this.usuarioRepository.obtenerUsuarioPorId(prismaEvent.operariosEncargado);
            if (encargado) {
                evento.setEncargado(encargado);
            }
        }

        // NUEVO: Si Prisma trajo a los participantes, los instanciamos de una vez
        if (prismaEvent.participantes && prismaEvent.participantes.length > 0) {
            const usuariosAsignados = await Promise.all(
                prismaEvent.participantes.map(async (p) => {
                    const u = p.usuario;
                    const rol = await this.usuarioRepository.asociarRol(u.rol);
                    return new Usuario(u.id, u.nombre, u.apellido, u.correo, u.contrasena, u.departamento, rol);
                })
            );
            evento.setParticipantes(usuariosAsignados);
        }

        return evento;
    }

    async getAllEventos(page: number): Promise<Evento[]> {
        const limit = 50;
        const skip = (page - 1) * limit;
        const eventosPrisma = await this.prisma.evento.findMany({
            skip,
            take: limit,
            include: this.includeParticipantes
        });
        return Promise.all(eventosPrisma.map(eventoPrisma => this.convertirAmodelo(eventoPrisma)));
    }

    async getActiveEventos(page: number): Promise<Evento[]> {
        const limit = 50;
        const skip = (page - 1) * limit;
        const eventosActivos = await this.prisma.evento.findMany({
            where: { estado: 'active' },
            skip,
            take: limit,
            include: this.includeParticipantes
        });
        return Promise.all(eventosActivos.map(eventoPrisma => this.convertirAmodelo(eventoPrisma)));
    }

    async getEventoById(id: string): Promise<Evento | null> {
        const eventoPrisma = await this.prisma.evento.findUnique({ 
            where: { id },
            include: this.includeParticipantes 
        });
        if (!eventoPrisma) return null;
        return await this.convertirAmodelo(eventoPrisma);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        const eventoNuevo = await this.prisma.evento.create({
            data: {
                titulo: evento.getNombre(),
                fechaInicio: evento.getFechaInicio(),
                fechaFinalizacion: evento.getFechaFinalizacion(),
                lugar: evento.getLugar(),
                estado: evento.getEstado(),
                categoria: evento.getCategoria(),
                cantidadPersonas: evento.getCantidadPersonas(),
            },
            include: this.includeParticipantes
        });
        return await this.convertirAmodelo(eventoNuevo);
    }

    async updateEvento(evento: Evento): Promise<boolean> {
        const resultado = await this.prisma.evento.update({
            where: { id: evento.getId() },
            data: {
                titulo: evento.getNombre(),
                fechaInicio: evento.getFechaInicio(),
                fechaFinalizacion: evento.getFechaFinalizacion(),
                lugar: evento.getLugar(),
                estado: evento.getEstado(),
                categoria: evento.getCategoria(),
                cantidadPersonas: evento.getCantidadPersonas(),
                operariosEncargado: evento.getEncargado()?.getId() ?? null
            },
        });
        return !!resultado;
    }

    async traerEventosPorIDs(ids: string[]): Promise<Evento[]> {
        const eventosPrisma = await this.prisma.evento.findMany({
            where: { id: { in: ids } },
            take: 50,
            include: this.includeParticipantes
        });
        return Promise.all(eventosPrisma.map(eventoPrisma => this.convertirAmodelo(eventoPrisma)));
    }

    async deleteEventos(ids: string[]): Promise<boolean> {
        const resultado = await this.prisma.evento.deleteMany({
            where: { id: { in: ids } },
        });
        return resultado.count > 0;
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        const LIMIT = 50;
        const skip = (filtros.page - 1) * LIMIT;
        
        const where : Prisma.EventoWhereInput = {
            ...(filtros.busqueda && {
                OR: [
                    { titulo: { contains: filtros.busqueda, mode: Prisma.QueryMode.insensitive } },
                    {
                        participantes: {
                            some: {
                                usuario: {
                                    OR: [
                                        { nombre: { contains: filtros.busqueda, mode: Prisma.QueryMode.insensitive } },
                                        { apellido: { contains: filtros.busqueda, mode: Prisma.QueryMode.insensitive } },
                                    ],
                                },
                            },
                        },
                    },
                ],
            }),
            ...(filtros.categoria && { categoria: filtros.categoria }),
            ...(filtros.estado && { estado: filtros.estado }),
            ...(filtros.participanteId && { participantes: { some: { usuarioId: filtros.participanteId } } }),
        };

        const eventos = await this.prisma.evento.findMany({
            where,
            skip,
            take: LIMIT,
            include: this.includeParticipantes // Trae todos los datos del usuario en la busqueda
        });

        return Promise.all(eventos.map(evento => this.convertirAmodelo(evento)));
    }
}