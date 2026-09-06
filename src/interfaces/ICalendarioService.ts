import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
export interface ICalendarioService {
    crearEvento(evento: Evento): Promise<string[]>;
    actualizarEvento(evento: Evento): Promise<void>;
    eliminarEvento(evento: Evento): Promise<void>;
    crearEventoRecurrentePadre(evento: Evento, rruleStr: string): Promise<string>;
    modificarEventoPadre(googleEventIdPadre: string, evento: Evento, ocurrenciaBase: Ocurrencia): Promise<void>;
    modificarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date, nuevosDatos: Ocurrencia, evento: Evento): Promise<string>;
    modificarInstanciaRecurrentePorId(idInstanciaGoogle: string, nuevosDatos: Ocurrencia, evento: Evento): Promise<void>;
    cancelarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date): Promise<string> ;
    cancelarInstanciaRecurrentePorId(idInstanciaGoogle: string): Promise<void>;

}