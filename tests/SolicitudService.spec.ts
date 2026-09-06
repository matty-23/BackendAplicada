/**
 * Tests unitarios de SolicitudService
 *
 * Framework: Jest + ts-jest
 * Para correr: npx jest src/tests/SolicitudService.spec.ts
 * O npm test para todos los tests
 * 
 * 
 * NOTA PARA EL GRUPO: Para que este archivo funcione, agregar al package.json:
 *   devDependencies: "jest", "@types/jest", "ts-jest"
 *   Y crear jest.config.ts (ver comentario al final del archivo)
 */

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SolicitudService } from '../src/services/SolicitudService';
import { Solicitud } from '../src/models/Solicitud';
import { BloqueSolicitud } from '../src/models/BloqueSolicitud';

// ─────────────────────────────────────────────────────────────
// HELPERS: construir fechas y DTOs reutilizables
// ─────────────────────────────────────────────────────────────

/** Devuelve una fecha N días hábiles en el futuro (seguro > 48hs hábiles) */
function fechaHabilFutura(diasHabiles: number = 10): Date {
    const fecha = new Date();
    let dias = 0;
    while (dias < diasHabiles) {
        fecha.setDate(fecha.getDate() + 1);
        const dia = fecha.getDay();
        if (dia !== 0 && dia !== 6) dias++; // skip sábados y domingos
    }
    return fecha;
}

function fechaISOHabilFutura(diasHabiles: number = 10): string {
    return fechaHabilFutura(diasHabiles).toISOString();
}

function dtoCrearValido() {
    const inicio = fechaISOHabilFutura(10);
    // Fin: 3 horas después del inicio
    const fin = new Date(new Date(inicio).getTime() + 3 * 60 * 60 * 1000).toISOString();

    return {
        tipoEvento: 'Congreso',
        necesidadOperario: true,
        autorizacionRectoria: true,
        bloques: [{ fechaInicio: inicio, fechaFinalizacion: fin, lugar: 'Aula Magna' }],
    };
}

// ─────────────────────────────────────────────────────────────
// MOCK del repositorio  (equivalente a Mock<ISolicitudRepository>)
// ─────────────────────────────────────────────────────────────

function crearMockRepo() {
    return {
        crear: jest.fn(),
        obtenerPorId: jest.fn(),
        listar: jest.fn(),
        listarPorUsuario: jest.fn(),
        actualizar: jest.fn(),
        eliminar: jest.fn(),
    };
}

// ─────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────

describe('SolicitudService', () => {
    let service: SolicitudService;
    let mockRepo: ReturnType<typeof crearMockRepo>;

    beforeEach(() => {
        mockRepo = crearMockRepo();
        // Creamos el service inyectando el mock como repositorio.
        // El segundo argumento (eventoService) lo dejamos undefined
        // porque en esta suite no testeamos la creación del Evento.
        service = new SolicitudService(mockRepo as any, undefined);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 1: Crear una solicitud válida
    // ─────────────────────────────────────────────────────────
    it('debería crear una solicitud cuando los datos son válidos', async () => {
        const dto = dtoCrearValido();

        // Configuramos el mock: cuando se llame a `crear`, devuelve una Solicitud falsa
        // equivalente a .Setup(repo => repo.Crear(It.IsAny<Solicitud>())).Returns(solicitudDummy)
        const solicitudDummy = new Solicitud(
            'uuid-1', 'usuario-1', dto.tipoEvento, 'pendiente',
            dto.necesidadOperario, dto.autorizacionRectoria
        );
        mockRepo.crear.mockResolvedValue(solicitudDummy);

        const resultado = await service.crear('usuario-1', dto as any);

        // Assertions (equivalentes a Assert.Equal / Assert.NotNull)
        expect(resultado).toBeDefined();
        expect(resultado.getEstado()).toBe('pendiente');
        expect(mockRepo.crear).toHaveBeenCalledTimes(1); // el repo fue llamado 1 vez
    });

    // ─────────────────────────────────────────────────────────
    // TEST 2: Regla de negocio — autorizacion de Rectoría obligatoria
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si autorizacionRectoria es false', async () => {
        const dto = { ...dtoCrearValido(), autorizacionRectoria: false };

        // .rejects.toThrow() es el equivalente a Assert.Throws<BadRequestException>(() => ...)
        await expect(service.crear('usuario-1', dto as any))
            .rejects.toThrow(BadRequestException);

        // El repositorio NUNCA debe ser llamado si la validación falla
        expect(mockRepo.crear).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 3: Regla de negocio — 48 horas hábiles de anticipación
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException si la fecha tiene menos de 48hs hábiles', async () => {
        const ahora = new Date();
        // Solo 2 horas en el futuro: claramente menos de 48hs hábiles
        const enDosHoras = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
        const fin = new Date(enDosHoras.getTime() + 60 * 60 * 1000);

        const dto = {
            ...dtoCrearValido(),
            bloques: [{
                fechaInicio: enDosHoras.toISOString(),
                fechaFinalizacion: fin.toISOString(),
                lugar: 'Sala 1',
            }],
        };

        await expect(service.crear('usuario-1', dto as any))
            .rejects.toThrow(BadRequestException);

        expect(mockRepo.crear).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 4: Regla de negocio — solo el dueño puede cancelar
    // ─────────────────────────────────────────────────────────
    it('debería lanzar ForbiddenException si un usuario distinto intenta cancelar', async () => {
        const solicitudAjena = new Solicitud(
            'uuid-1', 'otro-usuario', 'Congreso', 'pendiente', true, true
        );
        // Configuramos el mock para que devuelva esa solicitud cuando se busque por ID
        mockRepo.obtenerPorId.mockResolvedValue(solicitudAjena);

        // 'yo-usuario' intenta cancelar una solicitud que es de 'otro-usuario'
        await expect(service.cancelar('uuid-1', 'yo-usuario'))
            .rejects.toThrow(ForbiddenException);

        // No debe actualizar nada en la BD
        expect(mockRepo.actualizar).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 5: Regla de negocio — no se puede modificar si ya no está Pendiente
    // ─────────────────────────────────────────────────────────
    it('debería lanzar BadRequestException al intentar modificar una solicitud aceptada', async () => {
        const solicitudAceptada = new Solicitud(
            'uuid-2', 'usuario-1', 'Retiro', 'aceptada', false, true
        );
        mockRepo.obtenerPorId.mockResolvedValue(solicitudAceptada);

        const dto = { tipoEvento: 'Retiro Modificado' };

        await expect(service.modificar('uuid-2', 'usuario-1', dto as any))
            .rejects.toThrow(BadRequestException);

        expect(mockRepo.actualizar).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 6: Aceptar una solicitud pendiente debería cambiar su estado
    // ─────────────────────────────────────────────────────────
    it('debería aceptar correctamente una solicitud pendiente y llamar al repositorio', async () => {
        const solicitudPendiente = new Solicitud(
            'uuid-3', 'usuario-1', 'Graduación', 'pendiente', true, true
        );
        mockRepo.obtenerPorId.mockResolvedValue(solicitudPendiente);
        mockRepo.actualizar.mockResolvedValue(true);

        const dto = { tiempoAnticipacion: 60, cantidadOperariosDesignados: 3 };

        const resultado = await service.aceptar('uuid-3', dto as any);

        expect(resultado).toBe(true);
        // Verificamos que el estado haya sido cambiado a 'aceptada' antes de guardar
        expect(solicitudPendiente.getEstado()).toBe('aceptada');
        expect(solicitudPendiente.getTiempoAnticipacion()).toBe(60);
        expect(solicitudPendiente.getCantidadOperariosDesignados()).toBe(3);
        expect(mockRepo.actualizar).toHaveBeenCalledWith(solicitudPendiente);
    });
});
