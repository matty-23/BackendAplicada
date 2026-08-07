import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Evento } from '../models/Evento';
import { IEventoRepository } from '../interfaces/IEventoRepository';

@Injectable()
export class EventosRepository implements IEventoRepository {

    // Inyectamos la instancia única de Prisma
    constructor(private prisma: PrismaService) {}

    async getAllEventos(): Promise<Evento[]> {
        return this.prisma.onModuleInit().then(() => {
            return this.prisma.evento.findMany();
        });
    }

    async getActiveEventos(): Promise<Evento[]> {
        return this.prisma.onModuleInit().then(() => {
            return this.prisma.evento.findMany({
                where: { estado: 1 },
            });
        });
    }

    async getEventoById(id: string): Promise<Evento> {
        return this.prisma.onModuleInit().then(() => {
            return this.prisma.evento.findUnique({
                where: { id },
            });
        });
    }

    async addEvento(evento: Evento): Promise<Evento> {
        return this.prisma.onModuleInit().then(() => {
            return this.prisma.evento.create({
                data: {
                    id: evento.getId(),
                    nombre: evento.getNombre(),
                    fechaInicio: evento.getFechaInicio(),
                    fechaFinalizacion: evento.getFechaFinalizacion(),
                    lugar: evento.getLugar(),
                    estado: evento.getEstado(),
                    categoria: evento.getCategoria(),
                    cantidadPersonas: evento.getCantidadPersonas(),
                },
            });
        });
    }

    async updateEvento(evento: Evento): Promise<boolean> {
        return this.prisma.onModuleInit().then(async () => {
            const resultado = await this.prisma.evento.update({
                where: { id: evento.getId() },
                data: {
                    nombre: evento.getNombre(),
                    fechaInicio: evento.getFechaInicio(),
                    fechaFinalizacion: evento.getFechaFinalizacion(),
                    lugar: evento.getLugar(),
                    estado: evento.getEstado(),
                    categoria: evento.getCategoria(),
                    cantidadPersonas: evento.getCantidadPersonas(),
                },
            });
            return !!resultado;
        });
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
