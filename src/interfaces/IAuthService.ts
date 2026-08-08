export interface IAuthService {
    authenticate(username: string, password: string): Promise<boolean>;
    generarToken(usuarioId: string): Promise<string>;
    guardarToken(usuarioId: string, token: string): Promise<void>;
    refreshToken(oldToken: string): Promise<string>;
    cambiarContraseña(usuarioId: string, newPassword: string): Promise<void>;
}