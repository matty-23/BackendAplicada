import { IAuthService } from '../interfaces/IAuthService';
export class AuthService implements IAuthService {
    async authenticate(username: string, password: string): Promise<boolean> {
        // Implement authentication logic
        return false;
    }

    async generarToken(usuarioId: string): Promise<string> {
        // Implement token generation logic
        return "";
    }

    async guardarToken(usuarioId: string, token: string): Promise<void> {
        // Implement token saving logic
    }

    async refreshToken(oldToken: string): Promise<string> {
        // Implement refresh token logic
        return "";
    }
}