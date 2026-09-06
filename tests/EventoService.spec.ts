/**
 * Tests unitarios de EventoService
 *
 * Framework: Jest + ts-jest
 * Para correr: npx jest src/tests/EventoService.spec.ts
 * O npm test para todos los tests
 */

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventoService } from '../src/services/EventoService';
import { Evento } from '../src/models/Evento';
import { Ocurrencia } from '../src/models/Ocurrencia';
import { Usuario } from '../src/models/Usuario';
import { Visitante } from '../src/models/roles/Visitante';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Crea un Usuario dummy con rol Visitante */
function crearUsuarioDummy(id: string = 'user-1'): Usuario {
    return new Usuario(id, 'Juan', 'Pérez', 'juan@test.com', 'pass123', 'IT', new Visitante());
}

function dtoCrearEventoValido() {
    return {
        titulo: 'Congreso Anual',
        categoria: 'academico',
        ocurrencias: [
            {
                fechaInicio: '2026-12-01T10:00:00.000Z',
                fechaFinalizacion: '2026-12-01T13:00:00.000Z',
                lugar: 'Aula Magna',
                cantidadPersonas: 50,
                id_encargado: 'user-1',
                participantes: ['user-2', 'user-3'],
            },
        ],
    };
}

// ─────────────────────────────────────────────────────────────
// MOCKS de repositorios
// ─────────────────────────────────────────────────────────────

function crearMockEventoRepo() {
    return {
        getAllEventos: jest.fn(),
        getEventoById: jest.fn(),
        addEvento: jest.fn(),
        updateEvento: jest.fn(),
        updateOcurrencia: jest.fn(),
        traerEventosPorIDs: jest.fn(),
        deleteEventos: jest.fn(),
        filtrado: jest.fn(),
    };
}

function crearMockFilasRepo() {
    return {
        agregar: jest.fn(),
        eliminar: jest.fn(),
        agregarMuchos: jest.fn(),
        obtenerEventosDeUnUsuario: jest.fn(),
        actualizarMuchos: jest.fn(),
    };
}

function crearMockUsuarioRepo() {
    return {
        obtenerUsuarioPorId: jest.fn(),
        obtenerUsuarios: jest.fn(),
        obtenerUsuarioPorCorreo: jest.fn(),
        verificarCorreos: jest.fn(),
        crearUsuario: jest.fn(),
        actualizarUsuario: jest.fn(),
        reemplazarUsuario: jest.fn(),
        eliminarUsuario: jest.fn(),
        obtenerUsuariosPorIds: jest.fn(),
        asociarRol: jest.fn(),
    };
}

function crearMockCalendarioService() {
    return {
        crearEvento: jest.fn().mockResolvedValue(undefined),
        crearEventoRecurrentePadre: jest.fn().mockResolvedValue('google-event-id'),
        actualizarEvento: jest.fn().mockResolvedValue(undefined),
        eliminarEvento: jest.fn().mockResolvedValue(undefined),
        modificarEventoPadre: jest.fn().mockResolvedValue(undefined),
        modificarInstanciaRecurrente: jest.fn().mockResolvedValue(undefined),
    };
}

// ─────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────

describe('EventoService', () => {
    let service: EventoService;
    let mockEventoRepo: ReturnType<typeof crearMockEventoRepo>;
    let mockFilasRepo: ReturnType<typeof crearMockFilasRepo>;
    let mockUsuarioRepo: ReturnType<typeof crearMockUsuarioRepo>;
    let mockCalendarioService: ReturnType<typeof crearMockCalendarioService>;

    beforeEach(() => {
        mockEventoRepo = crearMockEventoRepo();
        mockFilasRepo = crearMockFilasRepo();
        mockUsuarioRepo = crearMockUsuarioRepo();
        mockCalendarioService = crearMockCalendarioService();
        service = new EventoService(
            mockEventoRepo as any,
            mockFilasRepo as any,
            mockUsuarioRepo as any,
            mockCalendarioService as any,
        );
    });

    // ─────────────────────────────────────────────────────────
    // TEST 1: Crear un evento válido con ocurrencias
    // ─────────────────────────────────────────────────────────
    it('debería crear un evento cuando los datos son válidos', async () => {
        const dto = dtoCrearEventoValido();

        const encargado = crearUsuarioDummy('user-1');
        const participante2 = crearUsuarioDummy('user-2');
        const participante3 = crearUsuarioDummy('user-3');

        mockUsuarioRepo.obtenerUsuarioPorId
            .mockResolvedValueOnce(encargado)
            .mockResolvedValueOnce(participante2)
            .mockResolvedValueOnce(participante3);

        const eventoDummy = new Evento('ev-1', dto.titulo, 'pendiente', dto.categoria);
        mockEventoRepo.addEvento.mockResolvedValue(eventoDummy);

        const resultado = await service.crearEventoMulti(dto as any);

        expect(resultado).toBeDefined();
        expect(resultado.getNombre()).toBe('Congreso Anual');
        expect(resultado.getEstado()).toBe('pendiente');
        expect(mockEventoRepo.addEvento).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 2: Encargado inexistente al crear evento
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si el encargado no existe', async () => {
        const dto = dtoCrearEventoValido();

        mockUsuarioRepo.obtenerUsuarioPorId.mockResolvedValue(null);

        await expect(service.crearEventoMulti(dto as any))
            .rejects.toThrow(BadRequestException);

        expect(mockEventoRepo.addEvento).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 3: Participante inexistente al crear evento
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si un participante no existe', async () => {
        const dto = dtoCrearEventoValido();

        const encargado = crearUsuarioDummy('user-1');
        mockUsuarioRepo.obtenerUsuarioPorId
            .mockResolvedValueOnce(encargado)   // encargado OK
            .mockResolvedValueOnce(null);       // primer participante no existe

        await expect(service.crearEventoMulti(dto as any))
            .rejects.toThrow(BadRequestException);

        expect(mockEventoRepo.addEvento).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 4: Actualizar detalles de un evento existente
    // ─────────────────────────────────────────────────────────
    it('debería actualizar titulo y categoría de un evento existente', async () => {
        const eventoDummy = new Evento('ev-1', 'Titulo Viejo', 'pendiente', 'academico');
        mockEventoRepo.getEventoById.mockResolvedValue(eventoDummy);
        mockEventoRepo.updateEvento.mockResolvedValue(true);

        const dto = { titulo: 'Titulo Nuevo', categoria: 'cultural' };

        const resultado = await service.updateDetallesEvento('ev-1', dto as any);

        expect(resultado).toBe(true);
        expect(eventoDummy.getNombre()).toBe('Titulo Nuevo');
        expect(eventoDummy.getCategoria()).toBe('cultural');
        expect(mockEventoRepo.updateEvento).toHaveBeenCalledWith(eventoDummy);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 5: Evento no encontrado al intentar actualizar
    // ─────────────────────────────────────────────────────────
    it('debería lanzar NotFoundException si el evento no existe al actualizar', async () => {
        mockEventoRepo.getEventoById.mockResolvedValue(null);

        const dto = { titulo: 'Nuevo' };

        await expect(service.updateDetallesEvento('ev-inexistente', dto as any))
            .rejects.toThrow(NotFoundException);

        expect(mockEventoRepo.updateEvento).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Actualizar ocurrencia con participante inexistente
    // ─────────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si un participante no existe al actualizar ocurrencia', async () => {
        const ocurrencia = new Ocurrencia('oc-1', 'ev-1', new Date(), new Date(), 'Aula 1');
        // El constructor de Evento: (id, nombre, estado, categoria, color, recurrencia, ocurrencias)
        const eventoDummy = new Evento('ev-1', 'Evento', 'pendiente', 'academico', '#B2FFFF', undefined, [ocurrencia]);
        mockEventoRepo.getEventoById.mockResolvedValue(eventoDummy);
        mockEventoRepo.updateOcurrencia.mockResolvedValue(true);
        mockUsuarioRepo.obtenerUsuarioPorId.mockResolvedValue(null); // participante no existe

        const dto = { participantes: ['user-fantasma'] };

        await expect(service.actualizarOcurrencia('ev-1', 'oc-1', dto as any))
            .rejects.toThrow(BadRequestException);

        expect(mockFilasRepo.actualizarMuchos).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 7: Agregar participantes — ninguno válido
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si ningún participante existe al inscribir', async () => {
        mockUsuarioRepo.obtenerUsuarioPorId.mockResolvedValue(null);

        await expect(service.agregarParticipantes('oc-1', ['user-x', 'user-y']))
            .rejects.toThrow(BadRequestException);

        expect(mockFilasRepo.agregarMuchos).not.toHaveBeenCalled();
    });
});
