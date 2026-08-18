import { Permiso } from "../models/roles/Permisos";
export interface IRol{
    getRol():string;
    tienePermiso(permiso:Permiso):boolean;
}