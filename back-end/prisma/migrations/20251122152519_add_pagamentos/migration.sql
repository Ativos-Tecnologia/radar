-- CreateTable
CREATE TABLE `Pagamento` (
    `id` VARCHAR(191) NOT NULL,
    `precatorioId` VARCHAR(191) NOT NULL,
    `dataPagamento` DATETIME(3) NOT NULL,
    `valor` DECIMAL(18, 2) NOT NULL,
    `tipo` ENUM('PARCELA', 'ACORDO', 'COMPENSACAO', 'OUTROS') NOT NULL DEFAULT 'PARCELA',
    `status` ENUM('PENDENTE', 'PAGO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `documento` VARCHAR(191) NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pagamento_precatorioId_dataPagamento_idx`(`precatorioId`, `dataPagamento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_precatorioId_fkey` FOREIGN KEY (`precatorioId`) REFERENCES `Precatorio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
