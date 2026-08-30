import { IEventoService } from '../interfaces/IEventoService.js';
import { IEventoRepository } from '../interfaces/IEventoRepository.js';
import { Evento } from '../models/Evento.js';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IParticipantes } from '../interfaces/IParticipantes.js';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { Ocurrencia } from '../models/Ocurrencia.js';
import { ActualizarOcurrenciaDTO } from '../DTO/OcurrenciaDto.js';
import { CrearEventoMultiDTO, ActualizarEventoDTO } from '../DTO/EventoDto.js';
import { Usuario } from '../models/Usuario.js';
export class EventoService implements IEventoService {
    constructor(
        @Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository,
        @Inject('IParticipantes') private readonly filasRepository: IParticipantes,
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository
    ) { }

    async getEventos(page: number): Promise<Evento[]> {
        return await this.eventoRepository.getAllEventos(page);
    }

    async getEventosporUsuario(idUsuario: string): Promise<Evento[]> {

        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idUsuario);
        if (!usuario) throw new BadRequestException('Usuario no existe');
        const eventosIds = await this.filasRepository.obtenerEventosDeUnUsuario(idUsuario);

        if (eventosIds.length === 0) return [];
        return await this.eventoRepository.traerEventosPorIDs(eventosIds);
    }

    async getEventoById(id: string): Promise<Evento | null> {
        return await this.eventoRepository.getEventoById(id);
    }

    async crearEventoMulti(dto: CrearEventoMultiDTO): Promise<Evento> {

        const categoria = dto.categoria || 'sin_categoria';
        const ocurrenciasModelo: Ocurrencia[] = [];

        for (const [index, oc] of dto.ocurrencias.entries()) {
            // ENCARGADO
            let encargado: Usuario | undefined = undefined;
            if (oc.id_encargado) {
                const usuario = await this.usuarioRepository.obtenerUsuarioPorId(oc.id_encargado);
                if (!usuario) {
                    throw new BadRequestException(`El usuario encargado ${oc.id_encargado} no existe`);
                }
                encargado = usuario;
            }
            // PARTICIPANTES
            const participantes: Usuario[] = [];
            if (oc.participantes?.length) {

                for (const participanteId of oc.participantes) {
                    const usuario = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);
                    console.log(usuario)
                    if (!usuario) {
                        throw new BadRequestException(`El participante ${participanteId} no existe`);
                    }
                    participantes.push(usuario);
                }
            }
            // OCURRENCIA
            const ocurrencia = new Ocurrencia(
                '0',
                '0',
                new Date(oc.fechaInicio),
                new Date(oc.fechaFinalizacion),
                oc.tipo,
                oc.lugar,
                oc.cantidadPersonas,
                encargado,
                participantes
            );
            ocurrenciasModelo.push(ocurrencia);
        }
        // EVENTO
        const evento = new Evento(
            '0',
            dto.titulo,
            'pendiente',
            categoria,
            dto.color,
            dto.recurrencia,
            ocurrenciasModelo
        );
        return await this.addEvento(evento);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        const nuevoEvento = await this.eventoRepository.addEvento(evento);

        return nuevoEvento;
    }
    async updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean> {

        // 1. Buscar evento
        const evento = await this.getEventoById(id);
        if (!evento) {
            throw new NotFoundException('Evento no encontrado');
        }
        // 2. ACTUALIZAR DATOS DEL EVENTO
        if (dto.titulo !== undefined) {
            evento.setNombre(dto.titulo);
        }
        if (dto.categoria !== undefined) {
            evento.setCategoria(dto.categoria);
        }
        if (dto.estado !== undefined) {
            evento.setEstado(dto.estado);
        }
        await this.eventoRepository.updateEvento(evento);


        // 3. ACTUALIZAR OCURRENCIAS
        if (!dto.ocurrencias?.length) {
            return true;
        }
        const ocurrenciasActuales = await evento.getOcurrencias();

        for (const ocDto of dto.ocurrencias) {
            const oc = ocurrenciasActuales.find(o => o.getId() === ocDto.id);
            if (!oc) { continue; }

            // DATOS DE LA OCURRENCIA
            if (ocDto.lugar !== undefined) {
                oc.setLugar(ocDto.lugar);
            }
            if (ocDto.fechaInicio !== undefined) {
                oc.setFechaInicio(new Date(ocDto.fechaInicio));
            }
            if (ocDto.fechaFinalizacion !== undefined) {
                oc.setFechaFinalizacion(new Date(ocDto.fechaFinalizacion));
            }
            if (ocDto.cantidadPersonas !== undefined) {
                oc.setCantidadPersonas(ocDto.cantidadPersonas);
            }

            // ENCARGADO}
            if (ocDto.id_encargado !== undefined) {
                if (ocDto.id_encargado === '') {
                    oc.setEncargado(undefined as any);
                } else {
                    const encargado = await this.usuarioRepository.obtenerUsuarioPorId(ocDto.id_encargado);
                    if (!encargado) {
                        throw new BadRequestException(`El usuario encargado ${ocDto.id_encargado} no existe`);
                    }
                    oc.setEncargado(encargado);
                }
            }

            // GUARDAR DATOS DE OCURRENCIA
            await this.eventoRepository.updateOcurrencia(oc);

            // PARTICIPANTES
            if (ocDto.participantes !== undefined) {
                const participantes: Usuario[] = [];
                for (const participanteId of ocDto.participantes) {
                    const participante = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);

                    if (!participante) {
                        throw new BadRequestException(`El participante ${participanteId} no existe`);
                    }
                    participantes.push(participante);
                }

                // Actualizamos el modelo
                oc.setParticipantes(participantes);
                // Actualizamos la relación en BD
                await this.filasRepository.actualizarMuchos(
                    oc.getId(),
                    participantes.map(participante => participante.getId())
                );
            }
        }

        return true;
    }

    async deleteEventos(ids: string[]): Promise<boolean> {
        return await this.eventoRepository.deleteEventos(ids);
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        return await this.eventoRepository.filtrado(filtros);
    }

    async actualizarOcurrencia(idEvento: string, idOcurrencia: string, dto: ActualizarOcurrenciaDTO): Promise<boolean> {

        const evento = await this.getEventoById(idEvento);

        if (!evento) {
            throw new NotFoundException('Evento no encontrado');
        }

        const ocurrencias = await evento.getOcurrencias();
        const ocurrencia = ocurrencias.find(o => o.getId() === idOcurrencia);

        if (!ocurrencia) {
            throw new NotFoundException('Ocurrencia no encontrada');
        }
        if (dto.fechaInicio !== undefined) {
            ocurrencia.setFechaInicio(new Date(dto.fechaInicio));
        }
        if (dto.fechaFinalizacion !== undefined) {
            ocurrencia.setFechaFinalizacion(new Date(dto.fechaFinalizacion));
        }
        if (dto.lugar !== undefined) {
            ocurrencia.setLugar(dto.lugar);
        }
        if (dto.cantidadPersonas !== undefined) {
            ocurrencia.setCantidadPersonas(dto.cantidadPersonas);
        }
        if (dto.id_encargado !== undefined) {
            // Vacío = quitar encargado
            if (dto.id_encargado === '') {
                ocurrencia.setEncargado(undefined);
            } else {
                const encargado = await this.usuarioRepository.obtenerUsuarioPorId(dto.id_encargado);
                if (!encargado) {
                    throw new BadRequestException(`El usuario encargado ${dto.id_encargado} no existe`);
                }
                ocurrencia.setEncargado(encargado);
            }
        }

        await this.eventoRepository.updateOcurrencia(ocurrencia);
        if (dto.participantes !== undefined) {
            const participantes: Usuario[] = [];
            for (const participanteId of dto.participantes) {
                const participante = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);
                if (!participante) {
                    throw new BadRequestException(`El participante ${participanteId} no existe`);
                }
                participantes.push(participante);
            }

            ocurrencia.setParticipantes(participantes);

            await this.filasRepository.actualizarMuchos(
                ocurrencia.getId(),
                participantes.map(
                    participante => participante.getId()
                )
            );
        }

        return true;
    }

    // Se inscribe al usuario en una ocurrencia puntual, no en el evento completo.
    async agregarParticipantes(idOcurrencia: string, participantes: string[]): Promise<{ advertencia?: string }> {
        const usuarios = await Promise.all(participantes.map(id => this.usuarioRepository.obtenerUsuarioPorId(id)));

        const participantesValidos = participantes.filter((_, index) => usuarios[index] !== null);
        const usuariosNoEncontrados = participantes.filter((_, index) => usuarios[index] === null);

        if (participantesValidos.length === 0) {
            throw new BadRequestException("No se pudo inscribir ningún usuario. Los IDs enviados no existen.");
        }

        await this.filasRepository.agregarMuchos(idOcurrencia, participantesValidos);

        if (usuariosNoEncontrados.length > 0) {
            return { advertencia: `Estos usuarios no se encontraron: ${usuariosNoEncontrados.join(", ")}` };
        }

        return {};
    }

    //Se elimina al usuario de la tabla intermedia cruzando su ID con el ID de la ocurrencia.
    async borrarParticipante(idOcurrencia: string, idUsuario: string): Promise<boolean> {
        return await this.filasRepository.eliminar(idOcurrencia, idUsuario);
    }

}