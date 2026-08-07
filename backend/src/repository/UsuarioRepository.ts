import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Usuario as PrismaUsuario, Prisma } from '@prisma/client'; 
import { Usuario } from '../models/Usuario';
import { type IUsuarioRepository, PartialUsuario } from '../interfaces/IUsuarioRepository';
import { Administrador } from '../models/Administrador';
import { IRol } from '../interfaces/IRol';
// import { Externo } from '../models/Externo'; // Faltan crear estos
// import { Invitado } from '../models/Invitado'; // Faltan crear estos

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(private prisma: PrismaService) {}

  private async  convertirAmodelo(prismaUser: PrismaUsuario): Promise<Usuario> {
    const rol= await this.asociarRol(prismaUser.rol); 

    return new Usuario(
      prismaUser.id,
      prismaUser.nombre,
      prismaUser.apellido,
      prismaUser.correo,
      prismaUser.contrasena,
      prismaUser.departamento,
      rol
    );
  }

  async asociarRol(rol: number): Promise<IRol> {
    switch (rol) {
        case 1:
            return new Administrador();
        default:
            return new Administrador(); 
    }
  }

  async asociarRolInverso(rol: IRol): Promise<number> {
    switch (rol.getRol()) {
        case 'invitado':
          return 1;
        default:
          return 1; }
    }

  async obtenerUsuarios(): Promise<Usuario[]> {
    const usuariosPrisma = await this.prisma.usuario.findMany();
    return Promise.all(usuariosPrisma.map(usuarioPrisma => this.convertirAmodelo(usuarioPrisma)));
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
    const usuarioPrisma = await this.prisma.usuario.findUnique({where: { id }});
    if (!usuarioPrisma) return null;
    return await this.convertirAmodelo(usuarioPrisma);
  }

  async crearUsuario(usuario: Usuario): Promise<Usuario> {
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre: usuario.getNombre(),
        apellido: usuario.getApellido(),
        correo: usuario.getCorreo(),
        contrasena: usuario.getContraseña(), 
        departamento: usuario.getDepartamento(),
        rol: await this.asociarRolInverso(usuario.rol), 
      },
    });
    return await this.convertirAmodelo(nuevoUsuario);
  }

  async actualizarUsuario(id: string, usuario: PartialUsuario): Promise<Usuario | null> {

    const usuarioActualizado = await this.prisma.usuario.update({where: { id },data: { ...usuario }, });
    return await this.convertirAmodelo(usuarioActualizado);
  }

  async reemplazarUsuario(id: string, usuario: Usuario): Promise<Usuario | null> {
    const usuarioReemplazado = await this.prisma.usuario.update({ where: { id },data: {nombre: usuario.getNombre(),apellido: usuario.getApellido(),correo: usuario.getCorreo(),departamento: usuario.getDepartamento(),rol: await this.asociarRolInverso(usuario.rol),}, });
    return await this.convertirAmodelo(usuarioReemplazado);
  }

  async eliminarUsuario(id: string): Promise<boolean> {
      const resultado = await this.prisma.usuario.delete({where: { id },});
      if (!resultado) return false;
      
      return true;
    
  }
}