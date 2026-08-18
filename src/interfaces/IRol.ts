import { Permiso } from "../../roles/Permisos";
export interface IRol{
    getRol():string;
    tienePermiso(permiso:Permiso):boolean;
}