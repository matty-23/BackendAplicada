import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ISolicitudService } from '../interfaces/ISolicitudService';
import { ISolicitudRepository } from '../interfaces/ISolicitudRepository';
import { Solicitud, EstadoSolicitud } from '../models/Solicitud';
import { BloqueSolicitud } from '../models/BloqueSolicitud';
import { CrearSolicitudDto } from '../DTO/SolicitudDto';
import { FiltrosSolicitudDto } from '../DTO/SolicitudDto';
import { ModificarSolicitudDto } from '../DTO/SolicitudDto';
import { AceptarSolicitudDto } from '../DTO/SolicitudDto';
import { RechazarSolicitudDto } from '../DTO/SolicitudDto';

@Injectable()
export class SolicitudService implements ISolicitudService {
    constructor(
        @Inject('ISolicitudRepository') private readonly solicitudRepo: ISolicitudRepository,
    ) {}

    async crear(idUsuario: string, dto: CrearSolicitudDto): Promise<Solicitud> {
        if (!dto.autorizacionRectoria) {
            throw new BadRequestException('Se requiere autorización de rectoría');
        }
        if (!dto.bloques || dto.bloques.length === 0) {
            throw new BadRequestException('Debe incluir al menos un bloque de fecha/hora/lugar');
        }

        this.validar48HsHabiles(dto.bloques[0].fecha);

        const bloques = dto.bloques.map(b => new BloqueSolicitud(
            '',
            '',
            new Date(b.fecha),
            new Date(`${b.fecha}T${b.horaInicio}`),
            new Date(`${b.fecha}T${b.horaFin}`),
            b.lugar,
        ));

        const solicitud = new Solicitud(
            '',
            idUsuario,
            dto.tipoEvento,
            dto.cantidadPersonas,
            dto.necesidadOperario,
            dto.autorizacionRectoria,
            EstadoSolicitud.PENDIENTE,
            bloques,
            undefined,
            undefined,
            dto.personaEncargada,
        );

        return this.solicitudRepo.crear(solicitud);
    }

    async listarPorUsuario(idUsuario: string): Promise<Solicitud[]> {
        return this.solicitudRepo.listarPorUsuario(idUsuario);
    }

    async listar(filtros: FiltrosSolicitudDto): Promise<Solicitud[]> {
        return this.solicitudRepo.listar(filtros);
    }

    async obtenerPorId(id: string): Promise<Solicitud | null> {
        return this.solicitudRepo.obtenerPorId(id);
    }

    //Regla de negocio: Solo el propietario puede modificar su solicitud si está Pendiente
    async modificar(id: string, idUsuario: string, dto: ModificarSolicitudDto): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (solicitud.getEstado() !== EstadoSolicitud.PENDIENTE) {
            throw new BadRequestException('Solo se pueden modificar solicitudes en estado Pendiente');
        }
        if (solicitud.getIdUsuarioSolicitante() !== idUsuario) {
            throw new ForbiddenException('No tenés permiso para modificar esta solicitud');
        }

        if (dto.bloques) {
            const nuevosBloques = dto.bloques.map(b => new BloqueSolicitud(
                '',
                solicitud.getId(),
                new Date(b.fecha),
                new Date(`${b.fecha}T${b.horaInicio}`),
                new Date(`${b.fecha}T${b.horaFin}`),
                b.lugar,
            ));
            nuevosBloques.forEach(b => solicitud.addBloque(b));
        }

        return this.solicitudRepo.actualizar(solicitud);
    }

    //Regla de negocio: Solo el propietario puede cancelar si está Pendiente
    async cancelar(id: string, idUsuario: string): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (solicitud.getEstado() !== EstadoSolicitud.PENDIENTE) {
            throw new BadRequestException('Solo se pueden cancelar solicitudes en estado Pendiente');
        }
        if (solicitud.getIdUsuarioSolicitante() !== idUsuario) {
            throw new ForbiddenException('No tenés permiso para cancelar esta solicitud');
        }
        return this.solicitudRepo.eliminar(id);
    }

    async aceptar(id: string, dto: AceptarSolicitudDto): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (solicitud.getEstado() !== EstadoSolicitud.PENDIENTE) {
            throw new BadRequestException('Solo se pueden aceptar solicitudes en estado Pendiente');
        }
        solicitud.setEstado(EstadoSolicitud.ACEPTADA);
        solicitud.setTiempoAnticipacion(dto.tiempoAnticipacion);
        if (dto.cantidadOperariosDesignados) {
            solicitud.setCantidadOperariosDesignados(dto.cantidadOperariosDesignados);
        }
        return this.solicitudRepo.actualizar(solicitud);
    }

    async rechazar(id: string, dto: RechazarSolicitudDto): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (solicitud.getEstado() !== EstadoSolicitud.PENDIENTE) {
            throw new BadRequestException('Solo se pueden rechazar solicitudes en estado Pendiente');
        }
        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        return this.solicitudRepo.actualizar(solicitud);
    }

    //Valida que la fecha esté a más de 48hs hábiles (excluye sábados y domingos)
    private validar48HsHabiles(fechaStr: string): void {
        const fechaSolicitada = new Date(fechaStr);
        const ahora = new Date();

        let horasHabilesAcumuladas = 0;
        const cursor = new Date(ahora);

        while (cursor < fechaSolicitada) {
            cursor.setHours(cursor.getHours() + 1);
            const dia = cursor.getDay(); // 0 = domingo, 6 = sábado
            if (dia !== 0 && dia !== 6) {
                horasHabilesAcumuladas++;
            }
            if (horasHabilesAcumuladas >= 48) break;
        }

        if (horasHabilesAcumuladas < 48) {
            throw new BadRequestException(
                'La fecha del evento debe tener al menos 48hs hábiles de anticipación',
            );
        }
    }
}