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
                oc.setIdApiGoggle(googleEventId);
            }
        }
        return nuevoEvento;
    }

    async updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean> {
        // 1. Buscar evento principal
        const evento = await this.getEventoById(id);
        if (!evento) {
            throw new NotFoundException('Evento no encontrado');
        }

        let tituloModificado = false;

        // 2. ACTUALIZAR DATOS GLOBALES DEL EVENTO (BD Local)
        if (dto.titulo !== undefined && dto.titulo !== evento.getNombre()) {
            evento.setNombre(dto.titulo);
            tituloModificado = true; // Levantamos una bandera si el título cambió
        }
        if (dto.categoria !== undefined) {
            evento.setCategoria(dto.categoria);
        }
        if (dto.estado !== undefined) {
            evento.setEstado(dto.estado);
        }

        await this.eventoRepository.updateEvento(evento);

        // 3. SINCRONIZAR TÍTULO EN GOOGLE CALENDAR (Si aplica)
        // Si el título cambió, debemos reflejarlo en Google Calendar antes de procesar las ocurrencias
        if (tituloModificado) {
            const ocurrencias = await evento.getOcurrencias();
            if (ocurrencias.length > 0) {
                const ocurrenciaBase = ocurrencias[0];
                const googleEventId = ocurrenciaBase.getIdApiGoogle();
                const recurrencia = evento.getRecurrencia();

                if (googleEventId) {
                    if (recurrencia && recurrencia !== 'unico') {
                        // Sincroniza el título en el Evento Maestro (impacta a toda la serie)
                        await this.calendarioService.modificarEventoPadre(
                            googleEventId,
                            evento,
                            ocurrenciaBase
                        );
                    } else {
                        // Sincroniza el evento único tradicional
                        await this.calendarioService.actualizarEvento(evento);
                    }
                }
            }
        }

        // 4. ACTUALIZAR OCURRENCIAS INDIVIDUALES
        // Delegamos en actualizarOcurrencia para que evalúe si es una excepción o un cambio de serie completo
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

    async actualizarOcurrencia(idEvento: string, idOcurrencia: string, dto: ActualizarOcurrenciaDTO): Promise<boolean> {
        const evento = await this.getEventoById(idEvento);
        if (!evento) throw new NotFoundException('Evento no encontrado');

        const ocurrencias = await evento.getOcurrencias();
        const ocurrencia = ocurrencias.find(o => o.getId() === idOcurrencia);
        if (!ocurrencia) throw new NotFoundException('Ocurrencia no encontrada');

        const fechaOriginal = new Date(ocurrencia.getFechaInicio());
        const googleEventId = ocurrencia.getIdApiGoogle() || ocurrencias[0]?.getIdApiGoogle();
        const recurrencia = evento.getRecurrencia();
        const esEventoRecurrente = recurrencia && recurrencia !== 'unico';

        const tipoPeticion = dto.tipo?.toUpperCase();
        const tipoActual = ocurrencia.getTipo()?.toUpperCase();

        // ==============================================================
        // CASO A: CREAR EXCEPCIÓN (Solo este evento)
        // ==============================================================
        if (esEventoRecurrente && tipoActual !== 'MODIFICADA' && tipoPeticion === 'MODIFICADA') {

            let nuevoEncargado = ocurrencia.getEncargado();

            if (dto.id_encargado !== undefined) {
                if (dto.id_encargado === null) {
                    nuevoEncargado = undefined; // Limpiamos el encargado
                } else {
                    nuevoEncargado = await this.usuarioRepository.obtenerUsuarioPorId(dto.id_encargado) || nuevoEncargado;
                }
            }

            // 1. Creamos la nueva ocurrencia aislada (no pisa a la base)
            const nuevaOcurrencia = new Ocurrencia(
                '0',
                idEvento,
                dto.fechaInicio ? new Date(dto.fechaInicio) : ocurrencia.getFechaInicio(),
                dto.fechaFinalizacion ? new Date(dto.fechaFinalizacion) : ocurrencia.getFechaFinalizacion(),
                'MODIFICADA',
                true,
                dto.lugar ?? ocurrencia.getLugar(),
                ocurrencia.getCantidadPersonas(),
                nuevoEncargado,
                ocurrencia.getParticipantes()
            );

            // 2. Sincronizamos con Google Calendar
            if (googleEventId) {
                const fechaModificar = (dto as any).fechaInstanciaOriginal
                    ? new Date((dto as any).fechaInstanciaOriginal)
                    : fechaOriginal;
                await this.calendarioService.modificarInstanciaRecurrente(googleEventId, fechaModificar, nuevaOcurrencia);
            }

            // 3. Guardamos la excepción en la Base de Datos
            const ocurrenciaCreada = await this.eventoRepository.crearOcurrencia(nuevaOcurrencia);

            // 4. Asignamos participantes
            if (dto.participantes !== undefined) {
                const participantes: Usuario[] = [];
                for (const participanteId of dto.participantes) {
                    const participante = await this.usuarioRepository.obtenerUsuarioPorId(participanteId);
                    if (participante) participantes.push(participante);
                }
                await this.filasRepository.actualizarMuchos(ocurrenciaCreada.getId(), participantes.map(p => p.getId()));
            }

            return true;
        }

        // ==============================================================
        // CASO B: ACTUALIZACIÓN NORMAL (Evento único, toda la serie, o editar excepción que YA existía)
        // ==============================================================
        if (dto.fechaInicio !== undefined) ocurrencia.setFechaInicio(new Date(dto.fechaInicio));
        if (dto.fechaFinalizacion !== undefined) ocurrencia.setFechaFinalizacion(new Date(dto.fechaFinalizacion));
        if (dto.lugar !== undefined) ocurrencia.setLugar(dto.lugar);
        if (dto.tipo !== undefined) ocurrencia.setTipo(dto.tipo);
        if (dto.fueActualizado !== undefined) ocurrencia.setEsModificado(dto.fueActualizado);
        if (dto.id_encargado !== undefined) {
            if (dto.id_encargado === null) {
                ocurrencia.setEncargado(undefined); // Limpiamos el encargado de la instancia
            } else {
                const encargado = await this.usuarioRepository.obtenerUsuarioPorId(dto.id_encargado);
                if (encargado) ocurrencia.setEncargado(encargado);
            }
        }

        if (esEventoRecurrente && googleEventId) {
            if (tipoPeticion === 'UNICO' || dto.tipo === 'unico') {
                await this.calendarioService.modificarEventoPadre(googleEventId, evento, ocurrencia);
            } else if (tipoActual === 'MODIFICADA') {
                // Si la ocurrencia YA era una excepción y se volvió a editar
                await this.calendarioService.modificarInstanciaRecurrente(googleEventId, fechaOriginal, ocurrencia);
            }
        }

        await this.eventoRepository.updateOcurrencia(ocurrencia);

        if (dto.participantes !== undefined) {
            const participantes: Usuario[] = [];
            for (const pId of dto.participantes) {
                const p = await this.usuarioRepository.obtenerUsuarioPorId(pId);
                if (p) participantes.push(p);
            }
            ocurrencia.setParticipantes(participantes);
            await this.filasRepository.actualizarMuchos(ocurrencia.getId(), participantes.map(p => p.getId()));
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