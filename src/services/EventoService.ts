import { IEventoService } from '../interfaces/IEventoService.js';
import { IEventoRepository } from '../interfaces/IEventoRepository.js';
import { Evento } from '../models/Evento.js';
import { EventoDto, CrearEventoDto } from '../DTO/EventoDTO.js';
import { Inject } from '@nestjs/common';
import { IEvento_UsuarioRepository } from '../interfaces/IEvento_UsuarioRepository.js';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository.js';
import { Usuario } from '../models/Usuario.js';

export class EventoService implements IEventoService {
    constructor(@Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository, @Inject('IEvento_UsuarioRepository') private readonly filasRepository: IEvento_UsuarioRepository, @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository) { }

    async getEventos(): Promise<Evento[]> {

        const eventos = await this.eventoRepository.getAllEventos();

        const eventoIds = eventos.map(evento => evento.getId());

        const participantes =
            await this.filasRepository.obtenerIdsUsuariosPorEventos(eventoIds);

        // Obtengo todos los IDs de usuarios sin repetir
        const usuarioIds = [
            ...new Set(
                Array.from(participantes.values()).flat()
            )
        ];
        const usuarios =
            await this.usuarioRepository.obtenerUsuariosPorIds(usuarioIds);

        // Para buscar rápidamente un usuario por ID
        const usuariosMap = new Map(
            usuarios.map(usuario => [usuario.getId(), usuario])
        );

        // Completo cada evento
        for (const evento of eventos) {

            const idsUsuarios =
                participantes.get(evento.getId()) ?? [];

            const usuariosEvento = idsUsuarios
                .map(id => usuariosMap.get(id))
                .filter((usuario): usuario is Usuario => usuario !== undefined);

            evento.setParticipantes(usuariosEvento);
        }

        return eventos;
    }


    async getEventoById(id: string): Promise<Evento | null> {
        const evento = await this.eventoRepository.getEventoById(id);

        if (!evento) {
            return null;
        }

        // Obtener los IDs de usuarios relacionados con el evento
        const participantes =
            await this.filasRepository.obtenerIdsUsuariosPorEventos([id]);

        const usuarioIds = participantes.get(id) ?? [];

        // Obtener los usuarios completos
        const usuarios =
            await this.usuarioRepository.obtenerUsuariosPorIds(usuarioIds);

        // Asignarlos al evento
        evento.setParticipantes(usuarios);

        return evento;
    }

    async addEvento(evento: Evento): Promise<Evento> {
        // 1. Crear el evento
        const nuevoEvento = await this.eventoRepository.addEvento(evento);

        // 2. Obtener los usuarios del evento
        const usuarios = evento.getParticipantes();

        // 3. Crear las relaciones Evento-Usuario
        for (const usuario of usuarios) {
            await this.filasRepository.agregar(
                nuevoEvento.getId(),
                usuario.getId()
            );
        }
        // 4. Devolver el evento creado
        nuevoEvento.setParticipantes(usuarios);

        return nuevoEvento;
    }

    async cambiarEncargado(idEvento: string, idEncargado: string): Promise<Evento | null> {
        const evento = await this.getEventoById(idEvento);
        if (!evento) return null;
        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idEncargado);
        if (!usuario) return null;
        // Verificar si el encargado ya es participante
        const participantes = evento.getParticipantes();

        const yaEsParticipante = participantes.some(
            participante => participante.getId() === idEncargado
        );

        // Si no está, agregarlo
        if (!yaEsParticipante) {
            evento.setParticipantes([
                ...participantes,
                usuario
            ]);
        }
        evento.setEncargado(usuario);
        console.log('preparando');
        await this.eventoRepository.updateEvento(evento);
        return evento;
    }
    async updateDetallesEvento(evento: Evento): Promise<boolean> {
        return await this.eventoRepository.updateEvento(evento);
    }

    async borrarParticipante(idEvento: string,idUsuario: string): Promise<Evento | null> {

        const evento = await this.getEventoById(idEvento);
        if (!evento) {
            return null;
        }
        await this.filasRepository.eliminar(idEvento,idUsuario);
        const eventoActualizado = await this.getEventoById(idEvento);
        if (eventoActualizado) return eventoActualizado;
        

        return null;
    }

    async agregarParticipantes(id: string, participantes: string[]): Promise<Evento | null> {
        await this.filasRepository.agregarMuchos(
            id,
            participantes
        );
        const eventoultimo = await this.getEventoById(id);
        if (eventoultimo) return eventoultimo
        return null
    }

    async deleteEvento(id: string): Promise<boolean> {
        return await this.eventoRepository.deleteEvento(id);
    }
}
