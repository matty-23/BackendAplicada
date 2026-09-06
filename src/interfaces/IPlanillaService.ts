import {Planilla} from "../models/Planilla";
import {filtrosPlanillaDto} from "../DTO/FiltrosDto";
export interface IPlanillaService {
    getAll(filtros: filtrosPlanillaDto): Promise<Planilla[]> ;
    getById(id: string): Promise<Planilla | null>;
    create(planilla: Planilla): Promise<Planilla>;
    update(id: string, planilla: Partial<Planilla>): Promise<Planilla | null>; 
    delete(id: string): Promise<boolean>;
}