/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  }
});