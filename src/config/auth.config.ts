import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaService } from "../prisma/PrismaService";
import { openAPI } from "better-auth/plugins";
import { render } from '@react-email/render';
import { RecuperacionPassword } from '../templates/recuperacion-contraseña';
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaService();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }, request) => {
        
        // El renderizador transforma el componente a HTML crudo asíncronamente
        const htmlGenerado = await render(
            RecuperacionPassword({ 
                nombre: user.name, 
                urlRecuperacion: url 
            })
        );

        await resend.emails.send({
            from: process.env.EMAIL_EMPRESA!,
            to: user.email,
            subject: "Restablecer tu contraseña - Aplicada",
            html: htmlGenerado
        });
    }
    },
    user: {
        additionalFields: {
            apellido: {
                type: "string",
                required: true,
            },
            departamento: {
                type: "string",
                required: true,
            },
            rol: {
                type: "number",
                required: true,
                defaultValue: 1,
                input: false,
            },
        },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        "http://localhost:3001", // Tu BFF (NestJS)
        "http://127.0.0.1:3001",
    ],
    plugins: [
        openAPI(),
    ],
});
