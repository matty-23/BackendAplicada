import { CorreoConfirmacionCuentaDTO, CorreoDTO, CorreoRecuperacionContrasenaDTO } from "../DTO/CorreoDTO";

export interface ICorreoService{
    enviarCorreo(correo: CorreoDTO): Promise<boolean>;
    enviarCorreoConfirmacionCuenta(correo: CorreoConfirmacionCuentaDTO): Promise<boolean>;
    enviarCorreoRecuperacionContrasena(correo: CorreoRecuperacionContrasenaDTO): Promise<boolean>;
    enviarCorreoNotificaciones(correo: CorreoDTO): Promise<boolean>;
}