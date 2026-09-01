import { Solicitud } from "../models/Solicitud";
import { FiltrosSolicitudDto } from "../DTO/SolicitudDto";

export abstract class ISolicitudRepository {
    abstract crear(solicitud: Solicitud): Promise<Solicitud>;
    abstract obtenerPorId(id: string): Promise<Solicitud | null>;
    abstract listar(filtros: FiltrosSolicitudDto, page?: number): Promise<Solicitud[]>;
    abstract listarPorUsuario(idUsuario: string, page?: number): Promise<Solicitud[]>;
    abstract actualizar(solicitud: Solicitud): Promise<boolean>;
    abstract eliminar(id: string): Promise<boolean>;
}
