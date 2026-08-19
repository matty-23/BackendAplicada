import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Participante as PrismaEvento, Prisma } from "../generated/prisma/client";
import { Evento } from '../models/Evento';
import { type IEvento_UsuarioRepository } from '../interfaces/IEvento_UsuarioRepository';
import { Usuario } from '../models/Usuario';


@Injectable()
export class Evento_UsuarioRepository implements IEvento_UsuarioRepository {
    constructor(@Inject(PrismaService) private prisma: PrismaService) { }

    async agregarMuchos(
        eventoId: string,
        usuarioIds: string[]
    ): Promise<void> {

        if (usuarioIds.length === 0) {
            return;
        }

        await this.prisma.participante.createMany({
            data: usuarioIds.map(usuarioId => ({
                eventoId,
                usuarioId,
            })),
            skipDuplicates: true,
        });
    }
    async agregar(eventoId: string, usuarioId: string): Promise<void> {
        const filaNueva = await this.prisma.participante.create({
            data: {
                eventoId: eventoId,
                usuarioId: usuarioId
            }
        });
    }
    async eliminar(eventoId: string, usuarioId: string): Promise<boolean> {
        const resultado = await this.prisma.participante.deleteMany({
            where: {
                eventoId: eventoId,
                usuarioId: usuarioId,
            },
        });


        return resultado.count > 0;
    }
    async obtenerEventosDeUnUsuario(IdUsuario: string): Promise<string[]> {
        const filas = await this.prisma.participante.findMany({
            where: {
                usuarioId: IdUsuario
            },
        })
        const resultado = filas.map(fila => fila.eventoId); // Fix 1: era fila.usuarioId — bug que devolvía IDs de usuario en lugar de IDs de evento
        return resultado;
    }

}