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
  - Added the required column `id_ocurrencia` to the `participante` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "participante" DROP CONSTRAINT "participante_evento_id_fkey";

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
ALTER TABLE "ocurrencias_evento" ADD CONSTRAINT "ocurrencias_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocurrencias_evento" ADD CONSTRAINT "ocurrencias_evento_id_encargado_fkey" FOREIGN KEY ("id_encargado") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_id_ocurrencia_fkey" FOREIGN KEY ("id_ocurrencia") REFERENCES "ocurrencias_evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
