import { IEventoService } from '../interfaces/IEventoService.js';
import { IEventoRepository } from '../interfaces/IEventoRepository.js';
import { Evento } from '../models/Evento.js';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IParticipantes } from '../interfaces/IParticipantes.js';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';
import { ActualizarEventoDTO } from '../DTO/EventoDto.js';
export class EventoService implements IEventoService {
    constructor(
        @Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository,
        @Inject('IParticipantes') private readonly filasRepository: IParticipantes,
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository
    ) { }

    async getEventos(page: number): Promise<Evento[]> {
        return await this.eventoRepository.getAllEventos(page);
    }

    async getEventosActive(page: number): Promise<Evento[]> {
        return await this.eventoRepository.getActiveEventos(page);
    }

    async getEventosporUsuario(idUsuario: string): Promise<Evento[]> {

        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idUsuario);
        if (!usuario) throw new BadRequestException('Usuario no existe');

        // El repositorio de filas ahora busca por id_ocurrencia, pero debe seguir
        // devolviendo los IDs de los eventos macro para cumplir con esta consulta
        const eventosIds = await this.filasRepository.obtenerEventosDeUnUsuario(idUsuario);

        if (eventosIds.length === 0) return [];
        return await this.eventoRepository.traerEventosPorIDs(eventosIds);
    }

    async getEventoById(id: string): Promise<Evento | null> {
        return await this.eventoRepository.getEventoById(id);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        // Prisma y el EventoRepository ya guardan el evento y sus ocurrencias en cascada
        const nuevoEvento = await this.eventoRepository.addEvento(evento);

        // Asociamos los participantes iniciales iterando sobre las ocurrencias
        const ocurrencias = await evento.getOcurrencias();
        for (const oc of ocurrencias) {
            const participantes = await oc.getParticipantes();
            if (participantes.length > 0) {
                await this.filasRepository.agregarMuchos(
                    oc.getId(),
                    participantes.map(p => p.getId())
                );
            }
        }
        console.log("===sdsdssd====== ADD EVENTO =======dsdsds===");
        console.log("Nombre:", evento.getNombre());
        console.log("Estado:", evento.getEstado());
        console.log("Categoría:", evento.getCategoria());
        console.log("================================");
        return nuevoEvento;
    }

async updateDetallesEvento(id: string, dto: ActualizarEventoDTO): Promise<boolean> {
    // 1. Buscamos el evento raíz
    const evento = await this.getEventoById(id);
    if (!evento) throw new NotFoundException('Evento no encontrado');

    // 2. Actualizamos campos del macro evento
    if (dto.titulo) evento.setNombre(dto.titulo);
    if (dto.categoria) evento.setCategoria(dto.categoria);
    if (dto.estado) evento.setEstado(dto.estado);

    await this.eventoRepository.updateEvento(evento);

    // 3. Iteramos sobre las ocurrencias modificadas
    if (dto.ocurrencias && dto.ocurrencias.length > 0) {
        const ocurrenciasActuales = await evento.getOcurrencias();
        
        for (const ocDto of dto.ocurrencias) {
            // Buscamos la ocurrencia correspondiente en la memoria
            const oc = ocurrenciasActuales.find(o => o.getId() === ocDto.id);
            
            if (oc) {
                // Actualizamos los campos individuales
                if (ocDto.lugar) oc.setLugar(ocDto.lugar);
                if (ocDto.fechaInicio) oc.setFechaInicio(new Date(ocDto.fechaInicio));
                if (ocDto.fechaFinalizacion) oc.setFechaFinalizacion(new Date(ocDto.fechaFinalizacion));
                if (ocDto.cantidadPersonas) oc.setCantidadPersonas(ocDto.cantidadPersonas);
                
                // Guardamos en la base de datos con tu método existente
                await this.eventoRepository.updateOcurrencia(oc);
            }
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

    // =========================================================================
    // MÉTODOS ADAPTADOS A OCURRENCIAS (Antes referenciaban al Evento)
    // =========================================================================

    /**
     * Ahora recibe idEvento para ubicar la raíz, e idOcurrencia para aplicar el cambio.
     */
    async cambiarEncargado(idEvento: string, idOcurrencia: string, idEncargado: string): Promise<boolean> {
        const evento = await this.getEventoById(idEvento);
        if (!evento) throw new NotFoundException('Evento no encontrado');

        const ocurrencias = await evento.getOcurrencias();
        const ocurrencia = ocurrencias.find(o => o.getId() === idOcurrencia);
        if (!ocurrencia) throw new NotFoundException('Ocurrencia no encontrada');

        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idEncargado);
        if (!usuario) throw new BadRequestException('Usuario encargado no existe');

        ocurrencia.setEncargado(usuario);
        
        // Delega la escritura al método especializado de actualización parcial
        return await this.eventoRepository.updateOcurrencia(ocurrencia);
    }

    /**
     * Se inscribe al usuario en una ocurrencia puntual, no en el evento completo.
     */
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

    /**
     * Se elimina al usuario de la tabla intermedia cruzando su ID con el ID de la ocurrencia.
     */
    async borrarParticipante(idOcurrencia: string, idUsuario: string): Promise<boolean> {
        return await this.filasRepository.eliminar(idOcurrencia, idUsuario);
    }
}