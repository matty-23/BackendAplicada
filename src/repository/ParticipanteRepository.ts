import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { type IParticipantes } from '../interfaces/IParticipantes';

@Injectable()
export class ParticipanteRepository implements IParticipantes {
    constructor(@Inject(PrismaService) private prisma: PrismaService) { }

    async agregarMuchos(
        idOcurrencia: string,
        usuarioIds: string[]
    ): Promise<void> {

        if (usuarioIds.length === 0) {
            return;
        }

        await this.prisma.participante.createMany({
            data: usuarioIds.map(usuarioId => ({
                idOcurrencia: idOcurrencia,
                usuarioId: usuarioId,
            })),
            skipDuplicates: true,
        });
    }

    async agregar(idOcurrencia: string, usuarioId: string): Promise<void> {
        await this.prisma.participante.create({
            data: {
                idOcurrencia: idOcurrencia,
                usuarioId: usuarioId
            }
        });
    }

    async eliminar(idOcurrencia: string, usuarioId: string): Promise<boolean> {
        const resultado = await this.prisma.participante.deleteMany({
            where: {
                idOcurrencia: idOcurrencia,
                usuarioId: usuarioId,
            },
        });

        return resultado.count > 0;
    }

    async obtenerEventosDeUnUsuario(IdUsuario: string): Promise<string[]> {
        // Buscamos las participaciones del usuario e incluimos la referencia al evento macro
        const filas = await this.prisma.participante.findMany({
            where: {
                usuarioId: IdUsuario
            },
            select: {
                ocurrencia: {
                    select: {
                        idEvento: true
                    }
                }
            }
        });

        // Extraemos los IDs de los eventos macro
        const idsEventos = filas.map(fila => fila.ocurrencia.idEvento);
        
        // Retornamos los IDs eliminando los duplicados (Set elimina las repeticiones)
        return [...new Set(idsEventos)];
    }
}