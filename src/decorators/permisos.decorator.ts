import { SetMetadata } from '@nestjs/common';
import { Permiso } from '../models/roles/Permisos';

export const PERMISOS_KEY = 'permisos';

/**
 * Declara qué permiso(s) necesita un endpoint.
 * Si el usuario tiene AL MENOS UNO de los permisos listados, puede pasar.
 *
 * @example
 * @RequierePermiso(Permiso.LISTAR_USUARIOS)
 * @Get('/usuarios')
 * getUsuarios() { ... }
 *
 * @example
 * @RequierePermiso(Permiso.AÑADIR_EVENTOS, Permiso.MODIFICAR_EVENTOS)
 * @Post('/eventos')
 * crearEvento() { ... }
 */
export const RequierePermiso = (...permisos: Permiso[]) =>
  SetMetadata(PERMISOS_KEY, permisos);