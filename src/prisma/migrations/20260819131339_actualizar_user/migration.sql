/*
  Warnings:

  - You are about to drop the column `cantidad_personas` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `equipamiento` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_finalizacion` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `lugar` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `operarios_encargado` on the `eventos` table. All the data in the column will be lost.
  - The primary key for the `participante` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `evento_id` on the `participante` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_ocurrencia` to the `participante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auditoria_log" DROP CONSTRAINT "auditoria_log_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "comentarios" DROP CONSTRAINT "comentarios_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "participante" DROP CONSTRAINT "participante_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "participante" DROP CONSTRAINT "participante_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "planilla_horas" DROP CONSTRAINT "planilla_horas_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_id_usuario_solicitante_fkey";

-- AlterTable
ALTER TABLE "eventos" DROP COLUMN "cantidad_personas",
DROP COLUMN "equipamiento",
DROP COLUMN "fecha_finalizacion",
DROP COLUMN "fecha_inicio",
DROP COLUMN "lugar",
DROP COLUMN "operarios_encargado";

-- AlterTable
ALTER TABLE "participante" DROP CONSTRAINT "participante_pkey",
DROP COLUMN "evento_id",
ADD COLUMN     "id_ocurrencia" UUID NOT NULL,
ADD CONSTRAINT "participante_pkey" PRIMARY KEY ("usuario_id", "id_ocurrencia");

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "apellido" VARCHAR(100) NOT NULL,
ADD COLUMN     "departamento" VARCHAR(100) NOT NULL,
ADD COLUMN     "rol" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "ocurrencias_evento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_evento" UUID NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL,
    "fecha_finalizacion" TIMESTAMPTZ(6) NOT NULL,
    "lugar" VARCHAR(255) NOT NULL,
    "cantidad_personas" INTEGER NOT NULL,
    "id_encargado" UUID,
    "equipamiento" TEXT,

    CONSTRAINT "ocurrencias_evento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_id_ocurrencia_fkey" FOREIGN KEY ("id_ocurrencia") REFERENCES "ocurrencias_evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocurrencias_evento" ADD CONSTRAINT "ocurrencias_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
