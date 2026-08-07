import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Usuario as PrismaUsuario, Prisma } from '@prisma/client'; 
import { Usuario } from '../models/Usuario';
import { type IUsuarioRepository, PartialUsuario } from '../interfaces/IUsuarioRepository';
import { Administrador } from '../models/Administrador';
// import { Externo } from '../models/Externo'; // Faltan crear estos
// import { Invitado } from '../models/Invitado'; // Faltan crear estos

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(private prisma: PrismaService) {}

  private mapToDomain(prismaUser: PrismaUsuario): Usuario {
    let rolObj;
    if (prismaUser.rol === 'administrador') {
        rolObj = new Administrador();
    } else {
        rolObj = new Administrador(); 
    }

    return new Usuario(
      prismaUser.id,
      prismaUser.nombre,
      prismaUser.apellido,
      prismaUser.correo,
      prismaUser.contrasena,
      prismaUser.departamento,
      rolObj
    );
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    const usuariosPrisma = await this.prisma.usuario.findMany();
    return usuariosPrisma.map(u => this.mapToDomain(u));
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
    const usuarioPrisma = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!usuarioPrisma) return null;
    return this.mapToDomain(usuarioPrisma);
  }

  async crearUsuario(usuario: Usuario): Promise<Usuario> {
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre: usuario.getNombre(),
        apellido: usuario.getApellido(),
        correo: usuario.getCorreo(),
        contraseña: usuario.getContraseña(), 
        departamento: usuario.getDepartamento(),
        rol: usuario.rol.getRol().toLowerCase(), // Guardamos el string en BD
      },
    });
    return this.mapToDomain(nuevoUsuario);
  }

  async actualizarUsuario(id: string, usuario: PartialUsuario): Promise<Usuario | null> {
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: { ...usuario }, // Actualiza solo los campos que vengan en el Partial
    });
    return this.mapToDomain(usuarioActualizado);
  }

  async reemplazarUsuario(id: string, usuario: Usuario): Promise<Usuario | null> {
    const usuarioReemplazado = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: usuario.getNombre(),
        apellido: usuario.getApellido(),
        correo: usuario.getCorreo(),
        departamento: usuario.getDepartamento(),
        rol: usuario.rol.getRol().toLowerCase(),
      },
    });
    return this.mapToDomain(usuarioReemplazado);
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    try {
      await this.prisma.usuario.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false; // Si Prisma tira error (ej. el ID no existe), retornamos false
    }
  }
}