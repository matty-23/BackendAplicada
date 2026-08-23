import { Solicitud } from '../models/Solicitud';
import { CrearSolicitudDto } from '../DTO/SolicitudDto';
import { FiltrosSolicitudDto } from '../DTO/SolicitudDto';
import { ModificarSolicitudDto } from '../DTO/SolicitudDto';
import { AceptarSolicitudDto } from '../DTO/SolicitudDto';
import { RechazarSolicitudDto } from '../DTO/SolicitudDto';

export abstract class ISolicitudService {

    abstract crear(idUsuario: string, dto: CrearSolicitudDto): Promise<Solicitud>;
    abstract listarPorUsuario(idUsuario: string): Promise<Solicitud[]>;
    abstract listar(filtros: FiltrosSolicitudDto): Promise<Solicitud[]>;
    abstract obtenerPorId(id: string): Promise<Solicitud | null>;
    abstract modificar(id: string, idUsuario: string, dto: ModificarSolicitudDto): Promise<boolean>;
    abstract cancelar(id: string, idUsuario: string): Promise<boolean>;
    abstract aceptar(id: string, dto: AceptarSolicitudDto): Promise<boolean>;
    abstract rechazar(id: string, dto: RechazarSolicitudDto): Promise<boolean>;
}