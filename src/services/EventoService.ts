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

        let googleEventId = '';

        if (!recurrencia || recurrencia === 'unico') {
            await this.calendarioService.crearEvento(nuevoEvento);
        } else {
            googleEventId = await this.calendarioService.crearEventoRecurrentePadre(nuevoEvento, recurrencia);
            const ocurrencias = await nuevoEvento.getOcurrencias();
            for (const oc of ocurrencias) {
                await this.eventoRepository.guardarGoogleEventId(oc.getId(), googleEventId);
                oc.setIdApiGoogle(googleEventId);
            }
        }
        return nuevoEvento;
    }


    async actualizarOcurrencia(
    idEvento: string,
    idOcurrencia: string,
    dto: ActualizarOcurrenciaDTO
): Promise<boolean> {

    const evento = await this.getEventoById(idEvento);

    if (!evento) {
        throw new NotFoundException('Evento no encontrado');
    }

    const ocurrencias = await evento.getOcurrencias();

    const ocurrencia = ocurrencias.find(
        o => o.getId() === idOcurrencia
    );

    const recurrencia = evento.getRecurrencia();

    const esEventoRecurrente =
        !!recurrencia && recurrencia !== 'unico';

    const tipoPeticion =
        dto.tipo?.toUpperCase();

    // =====================================================
    // CASO A
    // INSTANCIA FANTASMA DE UNA RECURRENCIA
    //
    // No existe físicamente en BD.
    // Se crea una excepción con ocurrencia_original.
    // =====================================================

    if (
        esEventoRecurrente &&
        !ocurrencia &&
        (
            tipoPeticion === 'MODIFICADA' ||
            tipoPeticion === 'CANCELADA'
        )
    ) {

        if (!dto.ocurrencia_original) {
            throw new BadRequestException(
                'Se requiere ocurrencia_original para modificar una instancia recurrente'
            );
        }

        const fechaOriginal =
            new Date(dto.ocurrencia_original);

        if (isNaN(fechaOriginal.getTime())) {
            throw new BadRequestException(
                'ocurrencia_original no es una fecha válida'
            );
        }

        const ocurrenciaBase = ocurrencias[0];

        if (!ocurrenciaBase) {
            throw new NotFoundException(
                'El evento recurrente no tiene una ocurrencia base'
            );
        }

        const googleEventId =
            ocurrenciaBase.getIdApiGoogle();

        // =================================================
        // CASO A.1
        // CANCELAR INSTANCIA FANTASMA
        // =================================================

        if (tipoPeticion === 'CANCELADA') {

            const participantesBase =
                await ocurrenciaBase.getParticipantes();

            const nuevaOcurrencia = new Ocurrencia(
                '0',
                idEvento,

                // La fecha de una cancelación representa
                // la instancia original.
                fechaOriginal,
                fechaOriginal,

                'CANCELADA',
                true,

                ocurrenciaBase.getLugar(),
                ocurrenciaBase.getCantidadPersonas(),
                ocurrenciaBase.getEncargado(),
                participantesBase,

                googleEventId,

                // IMPORTANTE:
                // esta es la instancia RRULE que estamos
                // reemplazando/cancelando.
                fechaOriginal
            );

            // Primero cancelamos en Google.
            if (googleEventId) {
                await this.calendarioService.cancelarInstanciaRecurrente(
                    googleEventId,
                    fechaOriginal
                );
            }

            // Después guardamos la excepción.
            await this.eventoRepository.crearOcurrencia(
                nuevaOcurrencia
            );

            return true;
        }

        // =================================================
        // CASO A.2
        // MODIFICAR SOLO ESTA INSTANCIA FANTASMA
        // =================================================

        // -----------------------------------------------
        // ENCARGADO
        // -----------------------------------------------

        let encargado =
            ocurrenciaBase.getEncargado();

        if (dto.id_encargado !== undefined) {

            if (dto.id_encargado === null) {

                encargado = undefined;

            } else {

                encargado =
                    await this.usuarioRepository.obtenerUsuarioPorId(
                        dto.id_encargado
                    ) ?? undefined;
            }
        }

        // -----------------------------------------------
        // PARTICIPANTES
        // -----------------------------------------------

        let participantes =
            await ocurrenciaBase.getParticipantes();

        if (dto.participantes !== undefined) {

            participantes = [];

            for (const participanteId of dto.participantes) {

                const participante =
                    await this.usuarioRepository.obtenerUsuarioPorId(
                        participanteId
                    );

                if (participante) {
                    participantes.push(participante);
                }
            }
        }

        // -----------------------------------------------
        // FECHAS
        // -----------------------------------------------

        const fechaInicio =
            dto.fechaInicio
                ? new Date(dto.fechaInicio)
                : fechaOriginal;

        const fechaFinalizacion =
            dto.fechaFinalizacion
                ? new Date(dto.fechaFinalizacion)
                : ocurrenciaBase.getFechaFinalizacion();

        // -----------------------------------------------
        // CREAR EXCEPCIÓN
        // -----------------------------------------------

        const nuevaOcurrencia = new Ocurrencia(
            '0',
            idEvento,

            fechaInicio,
            fechaFinalizacion,

            'MODIFICADA',
            true,

            dto.lugar ??
                ocurrenciaBase.getLugar(),

            dto.cantidadPersonas ??
                ocurrenciaBase.getCantidadPersonas(),

            encargado,

            participantes,

            googleEventId,

            // =================================================
            // IMPORTANTE
            //
            // Esto queda SIEMPRE apuntando a la instancia
            // original de la RRULE.
            //
            // Aunque después la fecha cambie 10 veces,
            // este valor NO cambia.
            // =================================================
            fechaOriginal
        );

        // -----------------------------------------------
        // GOOGLE CALENDAR
        // -----------------------------------------------

        if (googleEventId) {

            await this.calendarioService.modificarInstanciaRecurrente(
                googleEventId,
                fechaOriginal,
                nuevaOcurrencia
            );
        }

        // -----------------------------------------------
        // BD
        // -----------------------------------------------

        const ocurrenciaCreada =
            await this.eventoRepository.crearOcurrencia(
                nuevaOcurrencia
            );

        // -----------------------------------------------
        // PARTICIPANTES
        // -----------------------------------------------

        if (dto.participantes !== undefined) {

            await this.filasRepository.actualizarMuchos(
                ocurrenciaCreada.getId(),
                participantes.map(
                    p => p.getId()
                )
            );
        }

        return true;
    }

    // =====================================================
    // CASO B
    // OCURRENCIA FÍSICA EXISTENTE
    //
    // Puede ser:
    // - una ocurrencia normal
    // - una excepción MODIFICADA
    // - una excepción CANCELADA
    //
    // Si es una excepción, ocurrencia_original NO SE TOCA.
    // =====================================================

    if (!ocurrencia) {
        throw new NotFoundException(
            'Ocurrencia no encontrada'
        );
    }

    // =====================================================
    // IMPORTANTE
    //
    // Si esta ocurrencia es una excepción:
    //
    // original = 17/09
    // actual   = 19/09
    //
    // y la movemos:
    //
    // original = 17/09  ← NO CAMBIA
    // actual   = 21/09  ← CAMBIA
    // =====================================================

    const esExcepcion =
        ocurrencia.getOcurrenciaOriginal() !== undefined;

    const fechaOriginal =
        ocurrencia.getOcurrenciaOriginal()
        ?? ocurrencia.getFechaInicio();

    const googleEventId =
        ocurrencia.getIdApiGoogle()
        ?? ocurrencias[0]?.getIdApiGoogle();

    const tipoAnterior =
        ocurrencia.getTipo()?.toUpperCase();

    // =====================================================
    // ACTUALIZAR DATOS
    // =====================================================

    if (dto.fechaInicio !== undefined) {

        const nuevaFechaInicio =
            new Date(dto.fechaInicio);

        if (isNaN(nuevaFechaInicio.getTime())) {
            throw new BadRequestException(
                'fechaInicio no es una fecha válida'
            );
        }

        ocurrencia.setFechaInicio(
            nuevaFechaInicio
        );
    }

    if (dto.fechaFinalizacion !== undefined) {

        const nuevaFechaFinalizacion =
            new Date(dto.fechaFinalizacion);

        if (isNaN(nuevaFechaFinalizacion.getTime())) {
            throw new BadRequestException(
                'fechaFinalizacion no es una fecha válida'
            );
        }

        ocurrencia.setFechaFinalizacion(
            nuevaFechaFinalizacion
        );
    }

    if (dto.lugar !== undefined) {

        ocurrencia.setLugar(
            dto.lugar
        );
    }

    if (dto.cantidadPersonas !== undefined) {

        ocurrencia.setCantidadPersonas(
            dto.cantidadPersonas
        );
    }

    if (dto.tipo !== undefined) {

        ocurrencia.setTipo(
            dto.tipo
        );
    }

    if (dto.fueActualizado !== undefined) {

        ocurrencia.setEsModificado(
            dto.fueActualizado
        );
    }

    // =====================================================
    // ENCARGADO
    // =====================================================

    if (dto.id_encargado !== undefined) {

        if (dto.id_encargado === null) {

            ocurrencia.setEncargado(
                undefined
            );

        } else {

            const encargado =
                await this.usuarioRepository.obtenerUsuarioPorId(
                    dto.id_encargado
                );

            if (!encargado) {
                throw new NotFoundException(
                    'Encargado no encontrado'
                );
            }

            ocurrencia.setEncargado(
                encargado
            );
        }
    }

    // =====================================================
    // PARTICIPANTES
    // =====================================================

    let participantesActualizados:
        Usuario[] | undefined = undefined;

    if (dto.participantes !== undefined) {

        participantesActualizados = [];

        for (const participanteId of dto.participantes) {

            const participante =
                await this.usuarioRepository.obtenerUsuarioPorId(
                    participanteId
                );

            if (participante) {
                participantesActualizados.push(
                    participante
                );
            }
        }

        ocurrencia.setParticipantes(
            participantesActualizados
        );
    }

    // =====================================================
    // GOOGLE CALENDAR
    // =====================================================

    if (esEventoRecurrente && googleEventId) {

        // -----------------------------------------------
        // NORMAL / UNICO
        //
        // Modificación del padre de la recurrencia.
        // -----------------------------------------------

        if (
            tipoPeticion === 'NORMAL' ||
            tipoPeticion === 'UNICO'
        ) {

            await this.calendarioService.modificarEventoPadre(
                googleEventId,
                evento,
                ocurrencia
            );
        }

        // -----------------------------------------------
        // CANCELAR
        // -----------------------------------------------

        else if (
            tipoPeticion === 'CANCELADA'
        ) {

            if (esExcepcion) {

                // =================================================
                // YA ERA UNA EXCEPCIÓN
                //
                // Ejemplo:
                //
                // original = 17/09
                // actual   = 21/09
                //
                // No debemos buscar 17/09 en la RRULE porque
                // estamos cancelando la excepción actual.
                //
                // Acá necesitamos cancelar/eliminar la instancia
                // específica que ya fue modificada en Google.
                // =================================================

                const idGoogleExcepcion =
                    ocurrencia.getIdApiGoogle();

                if (idGoogleExcepcion) {

                    await this.calendarioService.cancelarInstanciaRecurrentePorId(
                        idGoogleExcepcion
                    );

                } else {

                    // Fallback por si la excepción no tiene
                    // guardado su ID de Google.
                    await this.calendarioService.cancelarInstanciaRecurrente(
                        googleEventId,
                        fechaOriginal
                    );
                }

            } else {

                // =================================================
                // ERA UNA INSTANCIA NORMAL/GHOST
                //
                // Se cancela la instancia original de la RRULE.
                // =================================================

                await this.calendarioService.cancelarInstanciaRecurrente(
                    googleEventId,
                    fechaOriginal
                );
            }
        }

        // -----------------------------------------------
        // EXCEPCIÓN MODIFICADA
        // -----------------------------------------------

        else if (
            tipoAnterior === 'MODIFICADA' ||
            esExcepcion
        ) {

            // =================================================
            // MUY IMPORTANTE:
            //
            // Buscamos la instancia original mediante
            // ocurrencia_original, NO mediante la nueva fecha.
            //
            // Ejemplo:
            //
            // original = 17/09
            // actual   = 21/09
            //
            // Google debe seguir identificando la instancia
            // original del 17/09.
            // =================================================

            await this.calendarioService.modificarInstanciaRecurrente(
                googleEventId,
                fechaOriginal,
                ocurrencia
            );
        }
    }

    // =====================================================
    // BD
    //
    // updateOcurrencia NO debe modificar
    // ocurrencia_original si ya existe.
    // =====================================================

    await this.eventoRepository.updateOcurrencia(
        ocurrencia
    );

    // =====================================================
    // PARTICIPANTES
    // =====================================================

    if (participantesActualizados !== undefined) {

        await this.filasRepository.actualizarMuchos(
            ocurrencia.getId(),
            participantesActualizados.map(
                p => p.getId()
            )
        );
    }

    return true;
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
        await this.eventoRepository.updateEvento(evento);
        // 3. SINCRONIZAR TÍTULO EN GOOGLE CALENDAR (Si aplica) 
        // Si el título cambió, debemos reflejarlo en Google Calendar antes de procesar las ocurrencias 
        if (tituloModificado) {
            const ocurrencias = await evento.getOcurrencias(); if (ocurrencias.length > 0) {
                const ocurrenciaBase = ocurrencias[0];
                const googleEventId = ocurrenciaBase.getIdApiGoogle();
                const recurrencia = evento.getRecurrencia(); if (googleEventId) {
                    if (recurrencia && recurrencia !== 'unico') {
                        // Sincroniza el título en el Evento Maestro (impacta a toda la serie) 
                        await this.calendarioService.modificarEventoPadre(googleEventId, evento, ocurrenciaBase);
                    } else {
                        // Sincroniza el evento único tradicional 
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