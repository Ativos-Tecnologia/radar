-- CreateTable
CREATE TABLE `SaldoConta` (
    `id` VARCHAR(191) NOT NULL,
    `enteId` VARCHAR(191) NOT NULL,
    `etiqueta` VARCHAR(191) NULL,
    `regime` ENUM('ESPECIAL', 'ORDINARIO') NOT NULL,
    `contaI` DECIMAL(18, 2) NOT NULL,
    `contaII` DECIMAL(18, 2) NOT NULL,
    `competencia` DATETIME(3) NOT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SaldoConta_competencia_idx`(`competencia`),
    UNIQUE INDEX `SaldoConta_enteId_competencia_key`(`enteId`, `competencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SaldoConta` ADD CONSTRAINT `SaldoConta_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `Ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
