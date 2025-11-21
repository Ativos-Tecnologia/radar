-- CreateTable
CREATE TABLE `Tribunal` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `tipo` ENUM('TJ', 'TRT', 'TRF', 'TST', 'TSE', 'STF', 'STJ') NOT NULL,
    `uf` VARCHAR(2) NULL,
    `regiao` INTEGER NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tribunal_sigla_key`(`sigla`),
    INDEX `Tribunal_sigla_idx`(`sigla`),
    INDEX `Tribunal_tipo_idx`(`tipo`),
    INDEX `Tribunal_uf_idx`(`uf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
