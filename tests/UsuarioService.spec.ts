/**
 * Tests unitarios de UsuarioService
 *
 * Framework: Jest + ts-jest
 * Para correr: npx jest src/tests/UsuarioService.spec.ts
 * O npm test para todos los tests
 */

import { NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UsuarioService } from '../src/services/UsuarioService';
import { Usuario } from '../src/models/Usuario';
import { IRol } from '../src/interfaces/IRol';
import { Visitante } from '../src/models/roles/Visitante';
import { Administrador } from '../src/models/roles/Administrador';
import { Externo } from '../src/models/roles/Externo';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Crea un Usuario dummy con el rol indicado */
function crearUsuarioDummy(id: string = 'user-1', rolInstance: IRol = new Visitante()): Usuario {
    return new Usuario(id, 'Juan', 'Pérez', 'juan@test.com', 'hash123', 'IT', rolInstance);
}

// ─────────────────────────────────────────────────────────────
// MOCK del repositorio
// ─────────────────────────────────────────────────────────────

function crearMockRepo() {
    return {
        obtenerUsuarios: jest.fn(),
        obtenerUsuarioPorId: jest.fn(),
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

// ─────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────

describe('UsuarioService', () => {
    let service: UsuarioService;
    let mockRepo: ReturnType<typeof crearMockRepo>;

    beforeEach(() => {
        mockRepo = crearMockRepo();
        service = new UsuarioService(mockRepo as any);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 1: Obtener usuario por ID existente
    // ─────────────────────────────────────────────────────────
    it('debería retornar el DTO del usuario cuando el ID existe', async () => {
        const usuario = crearUsuarioDummy('user-1');
        mockRepo.obtenerUsuarioPorId.mockResolvedValue(usuario);

        const resultado = await service.obtenerUsuarioPorId('user-1');

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe('user-1');
        expect(resultado.nombre).toBe('Juan');
        expect(resultado.apellido).toBe('Pérez');
        expect(resultado.correo).toBe('juan@test.com');
        expect(mockRepo.obtenerUsuarioPorId).toHaveBeenCalledWith('user-1');
    });

    // ─────────────────────────────────────────────────────────
    // TEST 2: Usuario no encontrado por ID
    // ─────────────────────────────────────────────────────────
    it('debería lanzar NotFoundException si el usuario no existe por ID', async () => {
        mockRepo.obtenerUsuarioPorId.mockResolvedValue(null);

        await expect(service.obtenerUsuarioPorId('user-inexistente'))
            .rejects.toThrow(NotFoundException);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 3: Obtener usuario por correo existente
    // ─────────────────────────────────────────────────────────
    it('debería retornar el DTO del usuario cuando el correo existe', async () => {
        const usuario = crearUsuarioDummy('user-1');
        mockRepo.obtenerUsuarioPorCorreo.mockResolvedValue(usuario);

        const resultado = await service.obtenerUsuarioPorCorreo('juan@test.com');

        expect(resultado).toBeDefined();
        expect(resultado.correo).toBe('juan@test.com');
        expect(mockRepo.obtenerUsuarioPorCorreo).toHaveBeenCalledWith('juan@test.com');
    });

    // ─────────────────────────────────────────────────────────
    // TEST 4: Usuario no encontrado por correo
    // ─────────────────────────────────────────────────────────
    it('debería lanzar NotFoundException si el usuario no existe por correo', async () => {
        mockRepo.obtenerUsuarioPorCorreo.mockResolvedValue(null);

        await expect(service.obtenerUsuarioPorCorreo('noexiste@test.com'))
            .rejects.toThrow(NotFoundException);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 5: Actualizar usuario correctamente
    // ─────────────────────────────────────────────────────────
    it('debería actualizar y retornar el DTO del usuario actualizado', async () => {
        const usuarioActualizado = new Usuario('user-1', 'Juan Mod', 'Gómez', 'juan@test.com', 'hash123', 'RRHH', new Visitante());
        mockRepo.actualizarUsuario.mockResolvedValue(usuarioActualizado);

        const dto = { nombre: 'Juan Mod', apellido: 'Gómez', correo: 'juan@test.com', departamento: 'RRHH' };

        const resultado = await service.actualizarUsuario('user-1', dto as any);

        expect(resultado).toBeDefined();
        expect(resultado.nombre).toBe('Juan Mod');
        expect(resultado.departamento).toBe('RRHH');
        expect(mockRepo.actualizarUsuario).toHaveBeenCalledTimes(1);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 6: Error interno al actualizar usuario
    // ─────────────────────────────────────────────────────────
    it('debería lanzar InternalServerErrorException si la actualización falla', async () => {
        mockRepo.actualizarUsuario.mockResolvedValue(null);

        const dto = { nombre: 'Nuevo' };

        await expect(service.actualizarUsuario('user-1', dto as any))
            .rejects.toThrow(InternalServerErrorException);
    });

    // ─────────────────────────────────────────────────────────
    // TEST 7: Eliminar usuario existente
    // ─────────────────────────────────────────────────────────
    it('debería eliminar un usuario existente y retornar true', async () => {
        const usuario = crearUsuarioDummy('user-1');
        mockRepo.obtenerUsuarioPorId.mockResolvedValue(usuario);
        mockRepo.eliminarUsuario.mockResolvedValue(true);

        const resultado = await service.eliminarUsuario('user-1');

        expect(resultado).toBe(true);
        expect(mockRepo.eliminarUsuario).toHaveBeenCalledWith('user-1');
    });

    // ─────────────────────────────────────────────────────────
    // TEST 8: No se puede eliminar un usuario inexistente
    // ─────────────────────────────────────────────────────────
    it('debería lanzar NotFoundException al eliminar un usuario inexistente', async () => {
        mockRepo.obtenerUsuarioPorId.mockResolvedValue(null);

        await expect(service.eliminarUsuario('user-inexistente'))
            .rejects.toThrow(NotFoundException);

        expect(mockRepo.eliminarUsuario).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────────────────
    // TEST 9: No se puede eliminar un administrador
    // ─────────────────────────────────────────────────────────
    it('debería lanzar ForbiddenException al intentar eliminar un administrador', async () => {
        const admin = crearUsuarioDummy('admin-1', new Administrador());
        mockRepo.obtenerUsuarioPorId.mockResolvedValue(admin);

        await expect(service.eliminarUsuario('admin-1'))
            .rejects.toThrow(ForbiddenException);

        expect(mockRepo.eliminarUsuario).not.toHaveBeenCalled();
    });
});
