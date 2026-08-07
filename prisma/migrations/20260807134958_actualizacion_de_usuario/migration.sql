/*
  Warnings:

  - The `rol` column on the `usuarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `departamento` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "departamento" SET NOT NULL,
DROP COLUMN "rol",
ADD COLUMN     "rol" INTEGER NOT NULL DEFAULT 1;
