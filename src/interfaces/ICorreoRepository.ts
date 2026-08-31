import { Correo } from "../models/Correo";

export interface ICorreoRepository {
    enviar(correo: Correo): Promise<boolean>;
}