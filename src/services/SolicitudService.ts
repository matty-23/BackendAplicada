import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException, Optional } from '@nestjs/common';
import { ISolicitudService } from '../interfaces/ISolicitudService';
import { type ISolicitudRepository } from '../interfaces/ISolicitudRepository';
import { type IEventoService } from '../interfaces/IEventoService';
import { Solicitud } from '../models/Solicitud';
import { BloqueSolicitud } from '../models/BloqueSolicitud';
import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
import { CrearSolicitudDto, ModificarSolicitudDto, AceptarSolicitudDto, FiltrosSolicitudDto, RechazarSolicitudDto } from '../DTO/SolicitudDto';

@Injectable()
export class SolicitudService implements ISolicitudService {
    constructor(
        @Inject('ISolicitudRepository') private readonly solicitudRepo: ISolicitudRepository,
        @Optional() @Inject('IEventoService') private readonly eventoService?: IEventoService,
    ) {}

    /**
     * Valida que la fecha de inicio tenga al menos 48 horas hábiles de anticipación (excluyendo sábados y domingos).
     */
    private validar48HsHabiles(fechaInicio: Date): void {
        const ahora = new Date();
        if (fechaInicio <= ahora) {
            throw new BadRequestException('La fecha del evento debe ser futura.');
        }

        let horasHabiles = 0;
        const cursor = new Date(ahora.getTime());

        while (cursor < fechaInicio) {
            cursor.setHours(cursor.getHours() + 1);
            const diaSemana = cursor.getDay(); // 0 = Domingo, 6 = Sábado
            if (diaSemana !== 0 && diaSemana !== 6) {
                horasHabiles++;
            }
        }

        if (horasHabiles < 48) {
            throw new BadRequestException(
                'La solicitud debe realizarse con al menos 48 horas hábiles de anticipación (excluyendo fines de semana).'
            );
        }
    }

    async crear(idUsuario: string, dto: CrearSolicitudDto): Promise<Solicitud> {
        if (!dto.autorizacionRectoria) {
            throw new BadRequestException('Es obligatoria la declaración de autorización de Rectoría para enviar la solicitud.');
        }

        if (!dto.bloques || dto.bloques.length === 0) {
            throw new BadRequestException('La solicitud debe contener al menos un bloque de fecha, horario y lugar.');
        }

        const primerBloqueInicio = new Date(dto.bloques[0].fechaInicio);
        this.validar48HsHabiles(primerBloqueInicio);

        const bloquesModelo = dto.bloques.map(b => {
            const inicio = new Date(b.fechaInicio);
            const fin = new Date(b.fechaFinalizacion);
            if (fin <= inicio) {
                throw new BadRequestException(`La fecha de fin no puede ser anterior o igual a la de inicio en el bloque con lugar: ${b.lugar}`);
            }
            return new BloqueSolicitud('0', '0', inicio, fin, b.lugar);
        });

        const nuevaSolicitud = new Solicitud(
            '0',
            idUsuario,
            dto.tipoEvento,
            'pendiente',
            dto.necesidadOperario,
            dto.autorizacionRectoria,
            dto.cantidadPersonas,
            dto.personaEncargada,
            undefined,
            undefined,
            bloquesModelo
        );

        return await this.solicitudRepo.crear(nuevaSolicitud);
    }

    async listarPorUsuario(idUsuario: string, page: number = 1): Promise<Solicitud[]> {
        return await this.solicitudRepo.listarPorUsuario(idUsuario, page);
    }

    async listar(filtros: FiltrosSolicitudDto, page: number = 1): Promise<Solicitud[]> {
        return await this.solicitudRepo.listar(filtros, page);
    }

    async obtenerPorId(id: string): Promise<Solicitud | null> {
        return await this.solicitudRepo.obtenerPorId(id);
    }

    async modificar(id: string, idUsuario: string, dto: ModificarSolicitudDto): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        
        if (!solicitud) {
            throw new NotFoundException('Solicitud no encontrada.');
        }

        if (solicitud.getEstado().toLowerCase() !== 'pendiente') {
            throw new BadRequestException('Solo se pueden modificar solicitudes en estado Pendiente.');
        }

        if (solicitud.getIdUsuarioSolicitante() !== idUsuario) {
            throw new ForbiddenException('No tiene permisos para modificar esta solicitud.');
        }

        if (dto.bloques !== undefined) {
            const bloquesActualizados = dto.bloques.map(b => 
                new BloqueSolicitud(
                    '0',
                    solicitud.getId(),
                    new Date(b.fechaInicio),
                    new Date(b.fechaFinalizacion),
                    b.lugar,
                )
            );

            solicitud.setBloques(bloquesActualizados);
        }   

        if (dto.autorizacionRectoria === false) {
            throw new BadRequestException(
                'Se requiere autorización de rectoría',
            );
        }

        if (dto.tipoEvento !== undefined) solicitud.setTipoEvento(dto.tipoEvento);
        if (dto.cantidadPersonas !== undefined) solicitud.setCantidadPersonas(dto.cantidadPersonas);
        if (dto.personaEncargada !== undefined) solicitud.setPersonaEncargada(dto.personaEncargada);
        if (dto.necesidadOperario !== undefined) solicitud.setNecesidadOperario(dto.necesidadOperario);
    
        return await this.solicitudRepo.actualizar(solicitud);
    }

    async cancelar(id: string, idUsuario: string): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) {
            throw new NotFoundException('Solicitud no encontrada.');
        }

        if (solicitud.getEstado().toLowerCase() !== 'pendiente') {
            throw new BadRequestException('No se puede cancelar una solicitud que ya ha sido procesada.');
        }

        if (solicitud.getIdUsuarioSolicitante() !== idUsuario) {
            throw new ForbiddenException('No tiene permisos para cancelar esta solicitud.');
        }

        solicitud.setEstado('cancelada');
        return await this.solicitudRepo.actualizar(solicitud);
    }

    async aceptar(id: string, dto: AceptarSolicitudDto): Promise<boolean> {
        const solicitud = await this.solicitudRepo.obtenerPorId(id);
        if (!solicitud) {
            throw new NotFoundException('Solicitud no encontrada.');
        }

        if (solicitud.getEstado().toLowerCase() !== 'pendiente') {
            throw new BadRequestException('Solo se pueden aceptar solicitudes en estado Pendiente.');
        }

        solicitud.setEstado('aceptada');
        solicitud.setTiempoAnticipacion(dto.tiempoAnticipacion);
        if (dto.cantidadOperariosDesignados !== undefined) {
            solicitud.setCantidadOperariosDesignados(dto.cantidadOperariosDesignados);
        }

        const actualizada = await this.solicitudRepo.actualizar(solicitud);

        if (actualizada && this.eventoService) {
            const bloques = await solicitud.getBloques();
            const ocurrenciasDto = bloques.map(b => ({
                fechaInicio: b.getFechaInicio().toISOString(),
                fechaFinalizacion: b.getFechaFinalizacion().toISOString(),
                lugar: b.getLugar(),
                cantidadPersonas: solicitud.getCantidadPersonas() ?? 0
            }));

            await this.eventoService.crearEventoMulti({
                titulo: solicitud.getTipoEvento() || 'Evento Solicitado',
                categoria: solicitud.getTipoEvento() || 'general',
                ocurrencias: ocurrenciasDto
            });
        }

        return actualizada;
    }

    async rechazar(id: string, dto?: RechazarSolicitudDto): Promise<boolean> {
    const solicitud = await this.solicitudRepo.obtenerPorId(id);

    if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.getEstado().toLowerCase() !== 'pendiente') {
        throw new BadRequestException(
            'Solo se pueden rechazar solicitudes pendientes',
        );
    }

    solicitud.setEstado('rechazada');

    return this.solicitudRepo.actualizar(solicitud);
    }
}