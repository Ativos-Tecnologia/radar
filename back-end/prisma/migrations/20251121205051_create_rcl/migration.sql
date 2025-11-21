-- CreateTable
CREATE TABLE `Rcl` (
    `id` VARCHAR(191) NOT NULL,
    `ano` INTEGER NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `tipo` ENUM('PREVISTO', 'REALIZADO') NOT NULL DEFAULT 'PREVISTO',
    `enteId` VARCHAR(191) NOT NULL,
    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Rcl_ano_idx`(`ano`),
    INDEX `Rcl_enteId_idx`(`enteId`),
    UNIQUE INDEX `Rcl_enteId_ano_tipo_key`(`enteId`, `ano`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rcl` ADD CONSTRAINT `Rcl_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `Ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
