import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { type IParticipantes } from '../interfaces/IParticipantes';

@Injectable()
export class ParticipanteRepository implements IParticipantes {
    constructor(
        @Inject(PrismaService)
        private prisma: PrismaService
    ) { }

    async agregarMuchos(idOcurrencia: string, usuarioIds: string[]): Promise<void> {

        if (usuarioIds.length === 0) {
            return;
        }

        await this.prisma.participante.createMany({
            data: usuarioIds.map(usuarioId => ({
                id_ocurrencia: idOcurrencia,
                usuarioId: usuarioId,
            })),
            skipDuplicates: true,
        });
    }

    async actualizarMuchos(idOcurrencia: string, participantesIds: string[]): Promise<void> {

        await this.prisma.participante.deleteMany({
            where: { id_ocurrencia: idOcurrencia, },
        });

        if (!participantesIds || participantesIds.length === 0) {
            return;
        }

        const idsUnicos = [...new Set(participantesIds)];

        await this.prisma.participante.createMany({
            data: idsUnicos.map((usuarioId) => ({
                id_ocurrencia: idOcurrencia,
                usuarioId: usuarioId,
            })),
            skipDuplicates: true,
        });
    }
    
    async agregar(idOcurrencia: string, usuarioId: string): Promise<void> {

        await this.prisma.participante.create({
            data: {
                id_ocurrencia: idOcurrencia,
                usuarioId: usuarioId,
            },
        });
    }

    async eliminar(idOcurrencia: string, usuarioId: string): Promise<boolean> {

        const resultado = await this.prisma.participante.deleteMany({
            where: {
                id_ocurrencia: idOcurrencia,
                usuarioId: usuarioId,
            },
        });

        return resultado.count > 0;
    }

    async obtenerEventosDeUnUsuario(idUsuario: string): Promise<string[]> {

        const filas = await this.prisma.participante.findMany({
            where: { usuarioId: idUsuario, },
            select: {
                ocurrencias_evento: {
                    select: { id_evento: true, },
                },
            },
        });
        const idsEventos = filas.map(fila => fila.ocurrencias_evento.id_evento);
        return [...new Set(idsEventos)];
    }
}