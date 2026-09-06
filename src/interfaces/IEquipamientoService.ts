import { Equipo } from "../models/Equipamiento";
import {filtrosEquipamientoDto} from "../DTO/FiltrosDto";
export interface IEquipamintoService {
    getAllEquipos(Filtros: filtrosEquipamientoDto): Promise<Equipo[]>;
    getEquipoById(id: string): Promise<Equipo | null>;
    createEquipo(equipo: Equipo): Promise<Equipo>;
    updateEquipo(id: string, equipo: Partial<Equipo>): Promise<Equipo | null>;
    deleteEquipo(id: string): Promise<boolean>;
}