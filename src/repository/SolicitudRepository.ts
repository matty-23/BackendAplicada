import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Prisma } from "../generated/prisma/client";
import { Solicitud } from '../models/Solicitud';
import { BloqueSolicitud } from '../models/BloqueSolicitud';
import { type ISolicitudRepository } from '../interfaces/ISolicitudRepository';
import { FiltrosSolicitudDto } from '../DTO/SolicitudDto';

@Injectable()
export class SolicitudRepository implements ISolicitudRepository {
    private readonly DEFAULT_PAGE_LIMIT = 50;

    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
    ) { }

    private convertirAmodelo(prismaSol: Prisma.SolicitudGetPayload<{}>): Solicitud {
        return new Solicitud(
            prismaSol.id,
            prismaSol.idUsuarioSolicitante,
            prismaSol.tipoEvento ?? 'general',
            prismaSol.estado ?? 'pendiente',
            prismaSol.necesidadOperario,
            prismaSol.autorizacionRectoria,
            prismaSol.cantidadPersona ?? undefined,
            prismaSol.personaEncargada ?? undefined,
            prismaSol.tiempoAnticipacion ?? undefined,
            prismaSol.cantidadOperariosDesignados ?? undefined,
            undefined,
            () => this.cargarBloquesDeSolicitud(prismaSol.id)
        );
    }

    private async cargarBloquesDeSolicitud(solicitudId: string): Promise<BloqueSolicitud[]> {
        const bloquesPrisma = await this.prisma.bloqueSolicitud.findMany({
            where: { idSolicitud: solicitudId },
            orderBy: { fechaInicio: 'asc' },
        });

        return bloquesPrisma.map(b => new BloqueSolicitud(
            b.id,
            b.idSolicitud,
            b.fechaInicio,
            b.fechaFinalizacion,
            b.lugar
        ));
    }

    async crear(solicitud: Solicitud): Promise<Solicitud> {
        const bloques = await solicitud.getBloques();
        const nuevaSolicitud = await this.prisma.solicitud.create({
            data: {
                idUsuarioSolicitante: solicitud.getIdUsuarioSolicitante(),
                tipoEvento: solicitud.getTipoEvento(),
                estado: solicitud.getEstado(),
                necesidadOperario: solicitud.getNecesidadOperario(),
                autorizacionRectoria: solicitud.getAutorizacionRectoria(),
                cantidadPersona: solicitud.getCantidadPersonas(),
                personaEncargada: solicitud.getPersonaEncargada(),
                tiempoAnticipacion: solicitud.getTiempoAnticipacion(),
                cantidadOperariosDesignados: solicitud.getCantidadOperariosDesignados(),
                bloques: {
                    create: bloques.map(b => ({
                        fechaInicio: b.getFechaInicio(),
                        fechaFinalizacion: b.getFechaFinalizacion(),
                        lugar: b.getLugar(),
                    }))
                }
            }
        });

        return this.convertirAmodelo(nuevaSolicitud);
    }

    async obtenerPorId(id: string): Promise<Solicitud | null> {
        const solicitudPrisma = await this.prisma.solicitud.findUnique({
            where: { id },
        });

        if (!solicitudPrisma) return null;
        return this.convertirAmodelo(solicitudPrisma);
    }

    async listar(filtros: FiltrosSolicitudDto, page: number = 1): Promise<Solicitud[]> {
        const skip = (page - 1) * this.DEFAULT_PAGE_LIMIT;
        const where: Prisma.SolicitudWhereInput = {};

        if (filtros.estado) {
            where.estado = { equals: filtros.estado, mode: 'insensitive' };
        }
        if (filtros.solicitanteId) {
            where.idUsuarioSolicitante = filtros.solicitanteId;
        }
        if (filtros.tipoEvento) {
            where.tipoEvento = { contains: filtros.tipoEvento, mode: 'insensitive' };
        }

        const solicitudes = await this.prisma.solicitud.findMany({
            where,
            skip,
            take: this.DEFAULT_PAGE_LIMIT,
            orderBy: { createdAt: 'desc' },
        });

        return solicitudes.map(s => this.convertirAmodelo(s));
    }

    async listarPorUsuario(idUsuario: string, page: number = 1): Promise<Solicitud[]> {
        const skip = (page - 1) * this.DEFAULT_PAGE_LIMIT;

        const solicitudes = await this.prisma.solicitud.findMany({
            where: { idUsuarioSolicitante: idUsuario },
            skip,
            take: this.DEFAULT_PAGE_LIMIT,
            orderBy: { createdAt: 'desc' },
        });

        return solicitudes.map(s => this.convertirAmodelo(s));
    }

    async actualizar(solicitud: Solicitud): Promise<boolean> {
        try {
            await this.prisma.solicitud.update({
                where: { id: solicitud.getId() },
                data: {
                    tipoEvento: solicitud.getTipoEvento(),
                    estado: solicitud.getEstado(),
                    necesidadOperario: solicitud.getNecesidadOperario(),
                    autorizacionRectoria: solicitud.getAutorizacionRectoria(),
                    cantidadPersona: solicitud.getCantidadPersonas(),
                    personaEncargada: solicitud.getPersonaEncargada(),
                    tiempoAnticipacion: solicitud.getTiempoAnticipacion(),
                    cantidadOperariosDesignados: solicitud.getCantidadOperariosDesignados(),
                },
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async eliminar(id: string): Promise<boolean> {
        try {
            await this.prisma.solicitud.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
