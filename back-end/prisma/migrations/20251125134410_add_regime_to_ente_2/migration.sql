/*
  Warnings:

  - The values [ORDINARIO] on the enum `saldoconta_regime` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ente` ADD COLUMN `regime` ENUM('ESPECIAL', 'COMUM') NOT NULL DEFAULT 'ESPECIAL';

-- AlterTable
ALTER TABLE `saldoconta` MODIFY `regime` ENUM('ESPECIAL', 'COMUM') NOT NULL;
