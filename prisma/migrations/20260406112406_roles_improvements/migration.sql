/*
  Warnings:

  - Made the column `isHidden` on table `roles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isHidden" SET NOT NULL,
ALTER COLUMN "isHidden" SET DEFAULT false;
