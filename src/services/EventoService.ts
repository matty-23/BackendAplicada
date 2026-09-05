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
import { ICalendarioService } from '../interfaces/ICalendarioService.js';
export class EventoService implements IEventoService {
    constructor(
        @Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository,
        @Inject('IParticipantes') private readonly filasRepository: IParticipantes,
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
        @Inject('ICalendarioService') private readonly calendarioService: ICalendarioService,
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
                false,
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
        const recurrencia = evento.getRecurrencia();

        // ==========================================
        // EVENTO SIN RECURRENCIA
        // ==========================================
        if (!recurrencia || recurrencia === 'unico') {

            const googleIds =
                await this.calendarioService.crearEvento(nuevoEvento);

            const ocurrencias = await nuevoEvento.getOcurrencias();

            for (let i = 0; i < ocurrencias.length; i++) {
                const ocurrencia = ocurrencias[i];
                const googleEventId = googleIds[i];

                ocurrencia.setIdApiGoogle(googleEventId);

                await this.eventoRepository.guardarGoogleEventId(
                    ocurrencia.getId(),
                    googleEventId
                );
            }

            // ==========================================
            // EVENTO RECURRENTE
            // ==========================================
        } else {

            const googleEventId =
                await this.calendarioService.crearEventoRecurrentePadre(
                    nuevoEvento,
                    recurrencia
                );

            const ocurrencias = await nuevoEvento.getOcurrencias();

            for (const ocurrencia of ocurrencias) {
                ocurrencia.setIdApiGoogle(googleEventId);

                await this.eventoRepository.guardarGoogleEventId(
                    ocurrencia.getId(),
                    googleEventId
                );
            }
        }

        return nuevoEvento;
    }


    // MÉTODO COORDINADOR PRINCIPAL
    async actualizarOcurrencia(idEvento: string, idOcurrencia: string, dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        const evento = await this.getEventoById(idEvento);

        if (!evento) {
            throw new NotFoundException('Evento no encontrado');
        }

        const ocurrencias = await evento.getOcurrencias();
        const ocurrencia = ocurrencias.find(o => o.getId() === idOcurrencia);

        const esRecurrente = !!evento.getRecurrencia() && evento.getRecurrencia() !== 'unico';
        const tipo = dto.tipo?.toUpperCase();

        // ==========================================
        // 1. GHOST DE RECURRENCIA (No existe en BD)
        // ==========================================
        if (esRecurrente && !ocurrencia) {
            if (tipo === 'MODIFICADA') {
                return await this.crearExcepcionModificada(evento, ocurrencias, dto);
            }
            if (tipo === 'CANCELADA') {
                return await this.crearExcepcionCancelada(evento, ocurrencias, dto);
            }
            throw new NotFoundException('La ocurrencia no existe');
        }

        if (!ocurrencia) {
            throw new NotFoundException('Ocurrencia no encontrada');
        }

        // ==========================================
        // 2. OCURRENCIA FÍSICA EXISTENTE (Excepción)
        // ==========================================
        const esExcepcion = ocurrencia.getOcurrenciaOriginal() !== undefined;

        if (esExcepcion) {
            if (tipo === 'CANCELADA') {
                return await this.cancelarExcepcion(ocurrencias, ocurrencia, dto); // Sin parámetro 'evento'
            }
            return await this.actualizarExcepcion(ocurrencias, ocurrencia, dto, evento); // Con parámetro 'evento'
        }

        if (tipo === 'CANCELADA') {
            return await this.cancelarOcurrenciaNormal(evento, ocurrencias, ocurrencia, dto);
        }

        return await this.actualizarOcurrenciaNormal(evento, ocurrencias, ocurrencia, dto);
    }


    // FUNCIONES ESPECÍFICAS DE RECURRENCIA
    private async crearExcepcionModificada(evento: Evento, ocurrencias: Ocurrencia[], dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        if (!dto.ocurrencia_original) {
            throw new BadRequestException('Se requiere ocurrencia_original para modificar una instancia recurrente');
        }

        const fechaOriginal = new Date(dto.ocurrencia_original);
        if (isNaN(fechaOriginal.getTime())) {
            throw new BadRequestException('ocurrencia_original no es una fecha válida');
        }

        const ocurrenciaBase = ocurrencias[0];
        if (!ocurrenciaBase) throw new NotFoundException('El evento recurrente no tiene una ocurrencia base');

        const googleEventId = ocurrenciaBase.getIdApiGoogle();

        let encargado = ocurrenciaBase.getEncargado();
        if (dto.id_encargado !== undefined) {
            encargado = dto.id_encargado === null
                ? undefined
                : await this.usuarioRepository.obtenerUsuarioPorId(dto.id_encargado) ?? undefined;
        }

        let participantes = await ocurrenciaBase.getParticipantes();
        if (dto.participantes !== undefined) {
            participantes = [];
            for (const participanteId of dto.participantes) {
                const participante = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);
                if (participante) participantes.push(participante);
            }
        }

        // CALCULAR DURACIÓN RELATIVA
        const duracion = ocurrenciaBase.getFechaFinalizacion().getTime() - ocurrenciaBase.getFechaInicio().getTime();
        const fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : fechaOriginal;
        const fechaFinalizacion = dto.fechaFinalizacion ? new Date(dto.fechaFinalizacion) : new Date(fechaInicio.getTime() + duracion);

        // Validación de fechas para la nueva excepción
        if (fechaFinalizacion <= fechaInicio) {
            throw new BadRequestException('La fecha de finalización debe ser posterior a la fecha de inicio');
        }

        const nuevaOcurrencia = new Ocurrencia(
            '0',
            evento.getId(),
            fechaInicio,
            fechaFinalizacion,
            'MODIFICADA',
            true,
            dto.lugar ?? ocurrenciaBase.getLugar(),
            dto.cantidadPersonas ?? ocurrenciaBase.getCantidadPersonas(),
            encargado,
            participantes,
            googleEventId, // Sigue siendo el ID del padre por ahora
            fechaOriginal
        );

        if (googleEventId) {
            const idInstancia = await this.calendarioService.modificarInstanciaRecurrente(googleEventId, fechaOriginal, nuevaOcurrencia, evento);
            nuevaOcurrencia.setIdApiGoogleInstancia(idInstancia);
        }

        const ocurrenciaCreada = await this.eventoRepository.crearOcurrencia(nuevaOcurrencia);
        if (dto.participantes !== undefined) {
            await this.filasRepository.actualizarMuchos(ocurrenciaCreada.getId(), participantes.map(p => p.getId()));
        }

        return true;
    }

    private async crearExcepcionCancelada(evento: Evento, ocurrencias: Ocurrencia[], dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        if (!dto.ocurrencia_original) {
            throw new BadRequestException('Se requiere ocurrencia_original para cancelar una instancia recurrente');
        }

        const fechaOriginal = new Date(dto.ocurrencia_original);
        if (isNaN(fechaOriginal.getTime())) {
            throw new BadRequestException('ocurrencia_original no es una fecha válida');
        }

        const ocurrenciaBase = ocurrencias[0];
        if (!ocurrenciaBase) throw new NotFoundException('El evento recurrente no tiene una ocurrencia base');

        const googleEventId = ocurrenciaBase.getIdApiGoogle();
        const participantesBase = await ocurrenciaBase.getParticipantes();

        const nuevaOcurrencia = new Ocurrencia(
            '0',
            evento.getId(),
            fechaOriginal,
            fechaOriginal,
            'CANCELADA',
            true,
            ocurrenciaBase.getLugar(),
            ocurrenciaBase.getCantidadPersonas(),
            ocurrenciaBase.getEncargado(),
            participantesBase,
            googleEventId,
            fechaOriginal
        );

        if (googleEventId) {
            const idInstancia = await this.calendarioService.cancelarInstanciaRecurrente(googleEventId, fechaOriginal);
            nuevaOcurrencia.setIdApiGoogleInstancia(idInstancia);
        }

        await this.eventoRepository.crearOcurrencia(nuevaOcurrencia);
        return true;
    }

    private async actualizarExcepcion(ocurrencias: Ocurrencia[], ocurrencia: Ocurrencia, dto: ActualizarOcurrenciaDTO, evento: Evento): Promise<boolean> {
        const fechaOriginal = ocurrencia.getOcurrenciaOriginal() ?? ocurrencia.getFechaInicio();
        const googleEventId = ocurrencia.getIdApiGoogle() ?? ocurrencias[0]?.getIdApiGoogle();

        const participantesActualizados = await this.aplicarCambiosFisicos(ocurrencia, dto);

        const idInstanciaGoogle = ocurrencia.getIdApiGoogleInstancia();

        if (idInstanciaGoogle) {
            await this.calendarioService.modificarInstanciaRecurrentePorId(idInstanciaGoogle, ocurrencia, evento);
        } else if (googleEventId) {
            // Fallback: 2 llamadas, pero lo curamos para la próxima
            const newId = await this.calendarioService.modificarInstanciaRecurrente(googleEventId, fechaOriginal, ocurrencia, evento);
            ocurrencia.setIdApiGoogleInstancia(newId);
        }

        await this.eventoRepository.updateOcurrencia(ocurrencia);
        if (participantesActualizados !== undefined) {
            await this.filasRepository.actualizarMuchos(ocurrencia.getId(), participantesActualizados.map(p => p.getId()));
        }

        return true;
    }

    private async cancelarExcepcion(ocurrencias: Ocurrencia[], ocurrencia: Ocurrencia, dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        const participantesActualizados = await this.aplicarCambiosFisicos(ocurrencia, dto);

        const fechaOriginal = ocurrencia.getOcurrenciaOriginal() ?? ocurrencia.getFechaInicio();
        const googleEventId = ocurrencia.getIdApiGoogle() ?? ocurrencias[0]?.getIdApiGoogle();

        // Evitamos cancelarInstanciaRecurrentePorId hasta estar seguros de qué guarda idApiGoogle
        const idInstanciaGoogle = ocurrencia.getIdApiGoogleInstancia();

        if (idInstanciaGoogle) {
            await this.calendarioService.cancelarInstanciaRecurrentePorId(idInstanciaGoogle);
        } else if (googleEventId) {
            const newId = await this.calendarioService.cancelarInstanciaRecurrente(googleEventId, fechaOriginal);
            ocurrencia.setIdApiGoogleInstancia(newId);
        }

        ocurrencia.setTipo('CANCELADA');
        ocurrencia.setEsModificado(true);
        await this.eventoRepository.updateOcurrencia(ocurrencia);
        if (participantesActualizados !== undefined) {
            await this.filasRepository.actualizarMuchos(ocurrencia.getId(), participantesActualizados.map(p => p.getId()));
        }

        return true;
    }

    private async actualizarOcurrenciaNormal(evento: Evento, ocurrencias: Ocurrencia[], ocurrencia: Ocurrencia, dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        const participantesActualizados = await this.aplicarCambiosFisicos(ocurrencia, dto);

        ocurrencia.setEsModificado(true);
        ocurrencia.setTipo('NORMAL');

        const googleEventId = ocurrencia.getIdApiGoogle() ?? ocurrencias[0]?.getIdApiGoogle();

        if (googleEventId && evento.getRecurrencia() && evento.getRecurrencia() !== 'unico') {
            await this.calendarioService.modificarEventoPadre(googleEventId, evento, ocurrencia);
        } else if (googleEventId) {
            await this.calendarioService.actualizarEvento(evento);
        }

        await this.eventoRepository.updateOcurrencia(ocurrencia);
        if (participantesActualizados !== undefined) {
            await this.filasRepository.actualizarMuchos(ocurrencia.getId(), participantesActualizados.map(p => p.getId()));
        }

        return true;
    }

    private async cancelarOcurrenciaNormal(evento: Evento, ocurrencias: Ocurrencia[], ocurrencia: Ocurrencia, dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        const participantesActualizados = await this.aplicarCambiosFisicos(ocurrencia, dto);

        const fechaOriginal = ocurrencia.getOcurrenciaOriginal() ?? ocurrencia.getFechaInicio();
        const googleEventId = ocurrencia.getIdApiGoogle() ?? ocurrencias[0]?.getIdApiGoogle();

        if (
            googleEventId &&
            evento.getRecurrencia() &&
            evento.getRecurrencia() !== 'unico'
        ) {
            const idInstancia = await this.calendarioService.cancelarInstanciaRecurrente(
                googleEventId,
                fechaOriginal
            );

            ocurrencia.setIdApiGoogleInstancia(idInstancia);
        }

        ocurrencia.setTipo('CANCELADA');
        ocurrencia.setEsModificado(true);

        await this.eventoRepository.updateOcurrencia(ocurrencia);
        if (participantesActualizados !== undefined) {
            await this.filasRepository.actualizarMuchos(ocurrencia.getId(), participantesActualizados.map(p => p.getId()));
        }

        return true;
    }

    // HELPER PARA CENTRALIZAR LA MUTACIÓN DE PROPIEDADES
    private async aplicarCambiosFisicos(ocurrencia: Ocurrencia, dto: ActualizarOcurrenciaDTO): Promise<Usuario[] | undefined> {
        // Validación de fechas combinadas si se envían ambas
        if (dto.fechaInicio !== undefined && dto.fechaFinalizacion !== undefined) {
            const inicio = new Date(dto.fechaInicio);
            const fin = new Date(dto.fechaFinalizacion);

            if (isNaN(inicio.getTime())) throw new BadRequestException('fechaInicio no es una fecha válida');
            if (isNaN(fin.getTime())) throw new BadRequestException('fechaFinalizacion no es una fecha válida');
            if (fin <= inicio) throw new BadRequestException('La fecha de finalización debe ser posterior a la fecha de inicio');

            ocurrencia.setFechaInicio(inicio);
            ocurrencia.setFechaFinalizacion(fin);
        } else {
            // Manejo de actualizaciones parciales de fecha
            if (dto.fechaInicio !== undefined) {
                const nuevaFechaInicio = new Date(dto.fechaInicio);
                if (isNaN(nuevaFechaInicio.getTime())) throw new BadRequestException('fechaInicio no es una fecha válida');

                if (ocurrencia.getFechaFinalizacion() <= nuevaFechaInicio) {
                    throw new BadRequestException('La nueva fecha de inicio supera o iguala a la fecha final actual');
                }
                ocurrencia.setFechaInicio(nuevaFechaInicio);
            }

            if (dto.fechaFinalizacion !== undefined) {
                const nuevaFechaFinalizacion = new Date(dto.fechaFinalizacion);
                if (isNaN(nuevaFechaFinalizacion.getTime())) throw new BadRequestException('fechaFinalizacion no es una fecha válida');

                if (nuevaFechaFinalizacion <= ocurrencia.getFechaInicio()) {
                    throw new BadRequestException('La nueva fecha de finalización es anterior o igual a la fecha inicial actual');
                }
                ocurrencia.setFechaFinalizacion(nuevaFechaFinalizacion);
            }
        }

        if (dto.lugar !== undefined) ocurrencia.setLugar(dto.lugar);
        if (dto.cantidadPersonas !== undefined) ocurrencia.setCantidadPersonas(dto.cantidadPersonas);
        if (dto.tipo !== undefined) ocurrencia.setTipo(dto.tipo);
        if (dto.fueActualizado !== undefined) ocurrencia.setEsModificado(dto.fueActualizado);

        if (dto.id_encargado !== undefined) {
            if (dto.id_encargado === null) {
                ocurrencia.setEncargado(undefined);
            } else {
                const encargado = await this.usuarioRepository.obtenerUsuarioPorId(dto.id_encargado);
                if (!encargado) throw new NotFoundException('Encargado no encontrado');
                ocurrencia.setEncargado(encargado);
            }
        }

        let participantesActualizados: Usuario[] | undefined = undefined;
        if (dto.participantes !== undefined) {
            participantesActualizados = [];
            for (const participanteId of dto.participantes) {
                const participante = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);
                if (participante) participantesActualizados.push(participante);
            }
            ocurrencia.setParticipantes(participantesActualizados);
        }

        return participantesActualizados;
    }

    async updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean> { // 1. Buscar evento principal 
        const evento = await this.getEventoById(id);
        if (!evento) { throw new NotFoundException('Evento no encontrado'); }
        let tituloModificado = false;
        // 2. ACTUALIZAR DATOS GLOBALES DEL EVENTO (BD Local) 
        if (dto.titulo !== undefined && dto.titulo !== evento.getNombre()) {
            evento.setNombre(dto.titulo); tituloModificado = true;
            // Levantamos una bandera si el título cambió 
        }
        if (dto.categoria !== undefined) { evento.setCategoria(dto.categoria); }
        if (dto.estado !== undefined) { evento.setEstado(dto.estado); }
        if ((dto as any).color !== undefined) { evento.setColor((dto as any).color); }
        if (dto.recurrencia !== undefined) { evento.setRecurrencia(dto.recurrencia); }
        await this.eventoRepository.updateEvento(evento);
        // 3. SINCRONIZAR TÍTULO EN GOOGLE CALENDAR
        if (tituloModificado || dto.recurrencia !== undefined) { // <-- Se actualiza si cambia titulo o recurrencia
            const ocurrencias = await evento.getOcurrencias(); 
            if (ocurrencias.length > 0) {
                const ocurrenciaBase = ocurrencias[0];
                const googleEventId = ocurrenciaBase.getIdApiGoogle();
                const recurrencia = evento.getRecurrencia(); 
                
                if (googleEventId) {
                    if (recurrencia && recurrencia !== 'unico') {
                        await this.calendarioService.modificarEventoPadre(googleEventId, evento, ocurrenciaBase);
                        
                        // 👇 ¡NUEVO: LIMPIAR LAS EXCEPCIONES HUÉRFANAS DE LA BD! 👇
                        const excepcionesIds = ocurrencias
                            .filter(o => o.getTipo() !== 'normal' && o.getTipo() !== 'unico' && o.getTipo() !== 'NORMAL')
                            .map(o => o.getId());
                        
                        if (excepcionesIds.length > 0) {
                            await this.eventoRepository.eliminarOcurrencias(excepcionesIds);
                        }
                        // 👆 ================================================== 👆

                    } else {
                        await this.calendarioService.actualizarEvento(evento);
                    }
                }
            }
        }
        // 4. ACTUALIZAR OCURRENCIAS INDIVIDUALES 
        // // Delegamos en actualizarOcurrencia para que evalúe si es una excepción o un cambio de serie completo 
        if (dto.ocurrencias?.length) {
            for (const ocDto of dto.ocurrencias) {
                // Reutilizamos el método para que maneje la BD local, participantes y la lógica de la API de Google
                await this.actualizarOcurrencia(id, ocDto.id, ocDto as ActualizarOcurrenciaDTO);
            }
        }
        return true;
    }


    async deleteEventos(ids: string[]): Promise<boolean> {
        const eventos = await Promise.all(ids.map(id => this.eventoRepository.getEventoById(id)));
        const eventosValidos = eventos.filter((evento): evento is Evento => evento !== null);

        // 2. Eliminar de Google Calendar
        for (const evento of eventosValidos) {
            await this.calendarioService.eliminarEvento(evento);
        }

        // 3. Eliminar de nuestra BD
        return await this.eventoRepository.deleteEventos(ids);
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        return await this.eventoRepository.filtrado(filtros);
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