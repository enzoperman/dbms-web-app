/*
  Warnings:

  - The values [REVIEWED] on the enum `StatusHistory_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [REVIEWED] on the enum `StatusHistory_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `semester` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Request` ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `semester` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('FOR_EVALUATION', 'PENDING', 'DISCREPANCY', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `RequestSubject` ADD COLUMN `schedule` VARCHAR(191) NULL,
    MODIFY `units` INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE `StatusHistory` MODIFY `status` ENUM('FOR_EVALUATION', 'PENDING', 'DISCREPANCY', 'APPROVED', 'REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `StudentProfile` ADD COLUMN `phone` VARCHAR(191) NULL;
