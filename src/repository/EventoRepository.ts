import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Evento as PrismaEvento, Prisma } from "../generated/prisma/client";
import { Evento } from '../models/Evento';
import { type IEventoRepository } from '../interfaces/IEventoRepository';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository';
@Injectable()
export class EventoRepository implements IEventoRepository {

    // Inyectamos la instancia única de Prisma
constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository
) { }

private async convertirAmodelo(prismaEvent: PrismaEvento): Promise<Evento> {
    const evento = new Evento(
        prismaEvent.id,
        prismaEvent.titulo,
        prismaEvent.fechaInicio,
        prismaEvent.fechaFinalizacion,
        prismaEvent.cantidadPersonas,
        prismaEvent.lugar,
        prismaEvent.estado,
        prismaEvent.categoria
    );

    if (prismaEvent.operariosEncargado) {
        // Usamos usuarioRepository para traer la entidad Usuario completa mapeada
        const encargado = await this.usuarioRepository.obtenerUsuarioPorId(prismaEvent.operariosEncargado);
        
        // Si no es null, se asigna al evento
        if (encargado) {
            evento.setEncargado(encargado);
        }
    }
    return evento;
}
    async getAllEventos(): Promise<Evento[]> {
        const eventosPrisma = await this.prisma.evento.findMany()
        return Promise.all(eventosPrisma.map(eventoPrisma => this.convertirAmodelo(eventoPrisma)))
    }


    async getActiveEventos(): Promise<Evento[]> {
        const eventosActivos = await this.prisma.evento.findMany({ where: { estado: 'active' }, })
        return Promise.all(eventosActivos.map(eventoPrisma => this.convertirAmodelo(eventoPrisma)))
    }

    async getEventoById(id: string): Promise<Evento | null> {
        const eventoPrisma = await this.prisma.evento.findUnique({ where: { id } });
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
        })
        return await this.convertirAmodelo(eventoNuevo)
    }

    async updateEvento(evento: Evento): Promise<boolean> {
        const resultado = await this.prisma.evento.update({
            where: {
                id: evento.getId()
            },
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

    async deleteEvento(id: string): Promise<boolean> {
        return this.prisma.onModuleInit().then(async () => {
            const resultado = await this.prisma.evento.delete({
                where: { id },
            });
            return !!resultado;
        });
    }

}
