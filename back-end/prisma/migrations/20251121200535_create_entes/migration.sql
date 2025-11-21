-- CreateTable
CREATE TABLE `Ente` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `tipo` ENUM('MUNICIPIO', 'ESTADO', 'UNIAO', 'AUTARQUIA', 'FUNDACAO', 'EMPRESA_PUBLICA', 'SOCIEDADE_ECONOMIA_MISTA') NOT NULL,
    `uf` VARCHAR(2) NULL,
    `entePrincipalId` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ente_cnpj_key`(`cnpj`),
    INDEX `Ente_cnpj_idx`(`cnpj`),
    INDEX `Ente_tipo_idx`(`tipo`),
    INDEX `Ente_entePrincipalId_idx`(`entePrincipalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ente` ADD CONSTRAINT `Ente_entePrincipalId_fkey` FOREIGN KEY (`entePrincipalId`) REFERENCES `Ente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
