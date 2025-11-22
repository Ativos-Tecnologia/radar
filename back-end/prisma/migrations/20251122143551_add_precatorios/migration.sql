-- CreateTable
CREATE TABLE `Precatorio` (
    `id` VARCHAR(191) NOT NULL,
    `enteId` VARCHAR(191) NOT NULL,
    `tribunalId` VARCHAR(191) NOT NULL,
    `npu` VARCHAR(191) NOT NULL,
    `processoOriginario` VARCHAR(191) NULL,
    `natureza` ENUM('ALIMENTAR', 'COMUM', 'OUTROS') NOT NULL,
    `fonte` VARCHAR(191) NULL,
    `ordemCronologica` VARCHAR(191) NULL,
    `anoLoa` INTEGER NULL,
    `dataLoa` DATETIME(3) NULL,
    `dataTransmissao` DATETIME(3) NULL,
    `valorAcao` DECIMAL(18, 2) NULL,
    `advogadosDevedora` VARCHAR(191) NULL,
    `advogadosCredora` VARCHAR(191) NULL,
    `observacoes` TEXT NULL,
    `dataAtualizacao` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Precatorio_enteId_idx`(`enteId`),
    INDEX `Precatorio_tribunalId_idx`(`tribunalId`),
    INDEX `Precatorio_anoLoa_idx`(`anoLoa`),
    UNIQUE INDEX `Precatorio_npu_tribunalId_key`(`npu`, `tribunalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrecatórioEvento` (
    `id` VARCHAR(191) NOT NULL,
    `precatorioId` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `valor` DECIMAL(18, 2) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PrecatórioEvento_precatorioId_ordem_idx`(`precatorioId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Precatorio` ADD CONSTRAINT `Precatorio_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `Ente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Precatorio` ADD CONSTRAINT `Precatorio_tribunalId_fkey` FOREIGN KEY (`tribunalId`) REFERENCES `Tribunal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrecatórioEvento` ADD CONSTRAINT `PrecatórioEvento_precatorioId_fkey` FOREIGN KEY (`precatorioId`) REFERENCES `Precatorio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
