import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from "../prisma/PrismaService";
import { Usuario as PrismaUsuario, Prisma } from "../generated/prisma/client";
import { Usuario } from '../models/Usuario';
import { type IUsuarioRepository, PartialUsuario } from '../interfaces/IUsuarioRepository';
import { RespuestaPaginada } from "../interfaces/IFiltrosUsuario";
import { GetUsuariosQueryDTO } from '../DTO/UsuarioDTO';
import { Administrador } from "../models/roles/Administrador";
import { Externo } from "../models/roles/Externo";
import { Visitante } from "../models/roles/Visitante";
import { Becario } from "../models/roles/Becario"
import { Empleado } from "../models/roles/Empleado"
import { Voluntario } from "../models/roles/Voluntario"
import { IRol } from '../interfaces/IRol';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  private async convertirAmodelo(prismaUser: PrismaUsuario): Promise<Usuario> {
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
            return new Visitante();

        case 2:
            return new Administrador();

        case 3:
            return new Externo();

        case 4:
            return new Becario();

        case 5:
            return new Empleado();

        case 6:
            return new Voluntario();
      default:
            throw new Error(`Rol no válido: ${rol}`);
    }
  }

  async asociarRolInverso(rol: IRol| string): Promise<number> {
    const nombreRol =typeof rol === 'string'? rol: rol.getRol();
    switch (nombreRol) {
        case 'invitado':
            return 1;

        case 'administrador':
            return 2;

        case 'externo':
            return 3;

        case 'becario':
            return 4;

        case 'empleado':
            return 5;

        case 'voluntario':
            return 6;

        default:
            throw new Error(`Rol no válido: ${nombreRol}`);
    }
}

  async obtenerUsuarios(filtros?: GetUsuariosQueryDTO,): Promise<RespuestaPaginada<Usuario>> {
  const rol = filtros?.rol? await this.asociarRolInverso(filtros.rol): undefined;
  //las primeras dos son para la cantidad de registros que salta y la cantidad maxima que agarra
  const skip = filtros?.skip ?? 0;
  const limit = filtros?.limit ?? 30;
  const ordenarPor = filtros?.ordenar ?? 'apellido';
  const orden = filtros?.orden ?? 'asc';
  //metemos dentro del where los filtros
  const where = {rol,departamento: filtros?.departamento,nombre: filtros?.nombre? {contains: filtros.nombre,mode: 'insensitive' as const,}: undefined,};
  //Filtramos y al mismo tiempo averiguamos la cantidad total de registros que hay en la tabla
  const [usuariosPrisma, total] = await Promise.all([
    this.prisma.usuario.findMany({where,skip,take: limit,orderBy: {[ordenarPor]: orden,},}),
    this.prisma.usuario.count({where,}),]);

  const usuarios = await Promise.all(usuariosPrisma.map((usuarioPrisma) =>this.convertirAmodelo(usuarioPrisma),),);
  //mandamos los usuarios y la metadata
  return {data: usuarios, meta: {total,skip,limit,hasMore: skip + usuarios.length < total,},};
}

  async obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
    const usuarioPrisma = await this.prisma.usuario.findUnique({where: { id }});
    if (!usuarioPrisma) return null;
    return await this.convertirAmodelo(usuarioPrisma);
  }

  async obtenerUsuarioPorCorreo(correo:string): Promise<Usuario|null>{
    const usuarioPrisma= await this.prisma.usuario.findUnique({where: { correo }});
    if(!usuarioPrisma) return null;
    return await this.convertirAmodelo(usuarioPrisma);
  }

  async verificarCorreos(correo:string): Promise<Boolean>{
    //Si el usuario no existe devuelve false
    const usuarioPrisma = await this.prisma.usuario.findUnique({where: { correo }}); 
    if(!usuarioPrisma) return false;
    return true;
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
  async obtenerUsuariosPorIds(ids: string[]): Promise<Usuario[]> {
  const usuariosPrisma = await this.prisma.usuario.findMany({
    where: {id: {in: ids,},},});

  return Promise.all(usuariosPrisma.map(usuarioPrisma =>this.convertirAmodelo(usuarioPrisma)));
}
}