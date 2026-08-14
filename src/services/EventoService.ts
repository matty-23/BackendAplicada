// services/EventoService.ts
import { IEventoService } from '../interfaces/IEventoService.js';
import { IEventoRepository } from '../interfaces/IEventoRepository.js';
import { Evento } from '../models/Evento.js';
import { EventoDto, CrearEventoDto } from '../DTO/EventoDto.js';
import { Inject, BadGatewayException, BadRequestException } from '@nestjs/common';
import { IEvento_UsuarioRepository } from '../interfaces/IEvento_UsuarioRepository.js';
import { IUsuarioRepository } from '../interfaces/IUsuarioRepository.js';
import { Usuario } from '../models/Usuario.js';
import { filtrosEventoDto } from '../DTO/FiltrosDto.js';

export class EventoService implements IEventoService {
    constructor(
        @Inject('IEventoRepository') private readonly eventoRepository: IEventoRepository, 
        @Inject('IEvento_UsuarioRepository') private readonly filasRepository: IEvento_UsuarioRepository, 
        @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository
    ) { }

    async getEventos(page: number): Promise<Evento[]> {
        // La BD ya lo devuelve con participantes
        return await this.eventoRepository.getAllEventos(page);
    }

    async getEventosActive(page: number): Promise<Evento[]> {
        return await this.eventoRepository.getActiveEventos(page);
    }

    async getEventosporUsuario(idUsuario: string): Promise<Evento[]> {
        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idUsuario);
        if (!usuario) throw new BadRequestException('Usuario no existe');

        const eventosIds = await this.filasRepository.obtenerEventosDeUnUsuario(idUsuario);
        
        if (eventosIds.length === 0) return [];
        
        // Ya no necesitas popular manualmente
        return await this.eventoRepository.traerEventosPorIDs(eventosIds);
    }

    async getEventoById(id: string): Promise<Evento | null> {
        // La consulta de Prisma ya te trae todo junto
        return await this.eventoRepository.getEventoById(id);
    }

    async addEvento(evento: Evento): Promise<Evento> {
        const nuevoEvento = await this.eventoRepository.addEvento(evento);
        const usuarios = evento.getParticipantes();
        for (const usuario of usuarios) {
            await this.filasRepository.agregar(
                nuevoEvento.getId(),
                usuario.getId()
            );
        }
        nuevoEvento.setParticipantes(usuarios);
        return nuevoEvento;
    }

    async cambiarEncargado(idEvento: string, idEncargado: string): Promise<Evento | null> {
        const evento = await this.getEventoById(idEvento);
        if (!evento) return null;

        const usuario = await this.usuarioRepository.obtenerUsuarioPorId(idEncargado);
        if (!usuario) return null;

        const participantes = evento.getParticipantes();
        const yaEsParticipante = participantes.some(participante => participante.getId() === idEncargado);

        if (!yaEsParticipante) evento.setParticipantes([...participantes, usuario]);
        
        evento.setEncargado(usuario);
        await this.eventoRepository.updateEvento(evento);
        return evento;
    }

    async updateDetallesEvento(evento: Evento): Promise<boolean> {
        return await this.eventoRepository.updateEvento(evento);
    }

    async borrarParticipante(idEvento: string, idUsuario: string): Promise<Evento | null> {
        const evento = await this.getEventoById(idEvento);
        if (!evento) return null;

        await this.filasRepository.eliminar(idEvento, idUsuario);
        return await this.getEventoById(idEvento); // Ya viene poblado y actualizado
    }

    async agregarParticipantes(id: string, participantes: string[]): Promise<Evento | null> {
        await this.filasRepository.agregarMuchos(id, participantes);
        return await this.getEventoById(id);
    }

    async deleteEventos(id: string[]): Promise<boolean> {
        return await this.eventoRepository.deleteEventos(id);
    }

    async filtrado(filtros: filtrosEventoDto): Promise<Evento[]> {
        // Delega todo el peso del filtrado y JOINs a Prisma y la BD
        return await this.eventoRepository.filtrado(filtros);
    }
}