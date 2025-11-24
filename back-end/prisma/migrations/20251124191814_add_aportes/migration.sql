-- CreateTable
CREATE TABLE `Aporte` (
    `id` VARCHAR(191) NOT NULL,
    `enteId` VARCHAR(191) NOT NULL,
    `ano` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `conta1` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `conta2` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `valorRepassado` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `valorDisponibilizado` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Aporte_enteId_idx`(`enteId`),
    INDEX `Aporte_ano_idx`(`ano`),
    INDEX `Aporte_mes_idx`(`mes`),
    UNIQUE INDEX `Aporte_enteId_ano_mes_key`(`enteId`, `ano`, `mes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aporte` ADD CONSTRAINT `Aporte_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `Ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
