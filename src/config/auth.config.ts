import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaService } from "../prisma/PrismaService";
import { openAPI } from "better-auth/plugins";

const prisma = new PrismaService();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
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
        "http://127.0.0.1:3001"
    ],
    plugins: [
        openAPI(),
    ],
});
