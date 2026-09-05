import { Evento } from '../models/Evento';
import { Ocurrencia } from '../models/Ocurrencia';
export interface ICalendarioService {
  crearEvento(evento: Evento): Promise<void>;
    actualizarEvento(evento: Evento): Promise<void>;
    eliminarEvento(evento: Evento): Promise<void>;
    crearEventoRecurrentePadre(evento: Evento, rruleStr: string): Promise<string>;
    modificarInstanciaRecurrente(googleEventIdPadre: string, fechaOriginal: Date, nuevosDatos: Ocurrencia): Promise<void> ;
    cancelarInstanciaRecurrente(googleEventId: string,fechaOriginal: Date): Promise<void> 
    modificarEventoPadre(googleEventIdPadre: string, evento: Evento, ocurrenciaBase: Ocurrencia): Promise<void>;
    cancelarInstanciaRecurrentePorId(idInstanciaGoogle: string): Promise<void> 
}