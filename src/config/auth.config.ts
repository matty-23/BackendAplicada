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
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
    "http://localhost:3000"
    ],
    plugins: [
        openAPI(),
    ],
});