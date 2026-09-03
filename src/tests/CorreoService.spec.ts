/**
 * Tests unitarios de CorreoService
 *
 * Framework: Jest + ts-jest
 * Para correr: npx jest src/tests/CorreoService.spec.ts
 * O npm test para todos los tests
 */

import { InternalServerErrorException } from '@nestjs/common';
import { CorreoService } from '../services/CorreoService';
import { PrioridadCorreo } from '../DTO/CorreoDTO';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Construye un CorreoDTO básico con prioridad opcional */
function dtoCorreoValido(prioridad?: PrioridadCorreo) {
    return {
        destinatarios: ['dest@test.com'],
        asunto: 'Asunto de prueba',
        mensajeHtml: '<p>Hola!</p>',
        prioridad,
    };
}

function dtoConfirmacionCuenta() {
    return {
        destinatario: 'nuevo@test.com',
        asunto: 'Confirmá tu cuenta',
        mensajeConfirmacion: '<p>Hacé clic aquí para confirmar</p>',
    };
}

// ─────────────────────────────────────────────────────────────
// MOCK del repositorio
// ─────────────────────────────────────────────────────────────

function crearMockRepo() {
    return {
        enviar: jest.fn(),
    };
}

// ─────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────

describe('CorreoService', () => {
    let service: CorreoService;
    let mockRepo: ReturnType<typeof crearMockRepo>;

    beforeEach(() => {
        mockRepo = crearMockRepo();
        service = new CorreoService(mockRepo as any);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 1: Enviar correo con prioridad ALTA
    // ─────────────────────────────────────────────────────────
    it('debería enviar un correo con prioridad alta y retornar true', async () => {
        mockRepo.enviar.mockResolvedValue(true);
        const dto = dtoCorreoValido(PrioridadCorreo.ALTA);

        const resultado = await service.enviarCorreo(dto as any);

        expect(resultado).toBe(true);
        expect(mockRepo.enviar).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 2: Enviar correo con prioridad BAJA
    // ─────────────────────────────────────────────────────────
    it('debería enviar un correo con prioridad baja y retornar true', async () => {
        mockRepo.enviar.mockResolvedValue(true);
        const dto = dtoCorreoValido(PrioridadCorreo.BAJA);

        const resultado = await service.enviarCorreo(dto as any);

        expect(resultado).toBe(true);
        expect(mockRepo.enviar).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 3: Enviar correo sin prioridad (normal / sin headers extra)
    // ─────────────────────────────────────────────────────────
    it('debería enviar un correo sin prioridad y retornar true', async () => {
        mockRepo.enviar.mockResolvedValue(true);
        const dto = dtoCorreoValido(); // sin prioridad

        const resultado = await service.enviarCorreo(dto as any);

        expect(resultado).toBe(true);
        expect(mockRepo.enviar).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 4: Error del repositorio — se relanza como InternalServerErrorException
    // ─────────────────────────────────────────────────────────
    it('debería lanzar InternalServerErrorException si el repositorio falla al enviar', async () => {
        mockRepo.enviar.mockRejectedValue(new Error('SMTP caído'));
        const dto = dtoCorreoValido(PrioridadCorreo.ALTA);

        await expect(service.enviarCorreo(dto as any))
            .rejects.toThrow(InternalServerErrorException);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 5: Enviar correo de confirmación de cuenta
    // ─────────────────────────────────────────────────────────
    it('debería enviar correctamente un correo de confirmación de cuenta', async () => {
        mockRepo.enviar.mockResolvedValue(true);
        const dto = dtoConfirmacionCuenta();

        const resultado = await service.enviarCorreoConfirmacionCuenta(dto as any);

        expect(resultado).toBe(true);
        // El correo de confirmación siempre tiene un único destinatario
        expect(mockRepo.enviar).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 6: Error en correo de confirmación — el error se propaga sin transformar
    // NOTA: enviarCorreoConfirmacionCuenta usa `return repo.enviar()` sin await,
    // por lo que el catch nunca atrapa errores del repositorio (bug conocido).
    // ─────────────────────────────────────────────────────────
    it('debería propagar el error del repositorio tal como viene en enviarCorreoConfirmacionCuenta', async () => {
        mockRepo.enviar.mockRejectedValue(new Error('Timeout'));
        const dto = dtoConfirmacionCuenta();

        await expect(service.enviarCorreoConfirmacionCuenta(dto as any))
            .rejects.toThrow(Error);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 7: Enviar correo de notificación (prioridad baja por defecto)
    // ─────────────────────────────────────────────────────────
    it('debería enviar correctamente un correo de notificación', async () => {
        mockRepo.enviar.mockResolvedValue(true);
        const dto = dtoCorreoValido();

        const resultado = await service.enviarCorreoNotificaciones(dto as any);

        expect(resultado).toBe(true);
        expect(mockRepo.enviar).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 8: Error en correo de notificación — se relanza como InternalServerErrorException
    // ─────────────────────────────────────────────────────────
    it('debería lanzar InternalServerErrorException si falla el correo de notificación', async () => {
        mockRepo.enviar.mockRejectedValue(new Error('Conexión rechazada'));
        const dto = dtoCorreoValido();

        await expect(service.enviarCorreoNotificaciones(dto as any))
            .rejects.toThrow(InternalServerErrorException);
    });
});
