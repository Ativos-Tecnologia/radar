-- DropForeignKey
ALTER TABLE `aporte` DROP FOREIGN KEY `Aporte_enteId_fkey`;

-- DropForeignKey
ALTER TABLE `ente` DROP FOREIGN KEY `Ente_entePrincipalId_fkey`;

-- DropForeignKey
ALTER TABLE `pagamento` DROP FOREIGN KEY `Pagamento_precatorioId_fkey`;

-- DropForeignKey
ALTER TABLE `precatorio` DROP FOREIGN KEY `Precatorio_enteId_fkey`;

-- DropForeignKey
ALTER TABLE `precatorio` DROP FOREIGN KEY `Precatorio_tribunalId_fkey`;

-- DropForeignKey
ALTER TABLE `precatórioevento` DROP FOREIGN KEY `PrecatórioEvento_precatorioId_fkey`;

-- DropForeignKey
ALTER TABLE `rcl` DROP FOREIGN KEY `Rcl_enteId_fkey`;

-- DropForeignKey
ALTER TABLE `saldoconta` DROP FOREIGN KEY `SaldoConta_enteId_fkey`;

-- AddForeignKey
ALTER TABLE `saldoconta` ADD CONSTRAINT `saldoconta_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `precatorio` ADD CONSTRAINT `precatorio_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `ente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `precatorio` ADD CONSTRAINT `precatorio_tribunalId_fkey` FOREIGN KEY (`tribunalId`) REFERENCES `tribunal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `precatórioevento` ADD CONSTRAINT `precatórioevento_precatorioId_fkey` FOREIGN KEY (`precatorioId`) REFERENCES `precatorio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamento` ADD CONSTRAINT `pagamento_precatorioId_fkey` FOREIGN KEY (`precatorioId`) REFERENCES `precatorio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ente` ADD CONSTRAINT `ente_entePrincipalId_fkey` FOREIGN KEY (`entePrincipalId`) REFERENCES `ente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcl` ADD CONSTRAINT `rcl_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aporte` ADD CONSTRAINT `aporte_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `ente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `aporte` RENAME INDEX `Aporte_ano_idx` TO `aporte_ano_idx`;

-- RenameIndex
ALTER TABLE `aporte` RENAME INDEX `Aporte_enteId_ano_mes_key` TO `aporte_enteId_ano_mes_key`;

-- RenameIndex
ALTER TABLE `aporte` RENAME INDEX `Aporte_enteId_idx` TO `aporte_enteId_idx`;

-- RenameIndex
ALTER TABLE `aporte` RENAME INDEX `Aporte_mes_idx` TO `aporte_mes_idx`;

-- RenameIndex
ALTER TABLE `ente` RENAME INDEX `Ente_cnpj_idx` TO `ente_cnpj_idx`;

-- RenameIndex
ALTER TABLE `ente` RENAME INDEX `Ente_cnpj_key` TO `ente_cnpj_key`;

-- RenameIndex
ALTER TABLE `ente` RENAME INDEX `Ente_entePrincipalId_idx` TO `ente_entePrincipalId_idx`;

-- RenameIndex
ALTER TABLE `ente` RENAME INDEX `Ente_tipo_idx` TO `ente_tipo_idx`;

-- RenameIndex
ALTER TABLE `pagamento` RENAME INDEX `Pagamento_precatorioId_dataPagamento_idx` TO `pagamento_precatorioId_dataPagamento_idx`;

-- RenameIndex
ALTER TABLE `precatorio` RENAME INDEX `Precatorio_anoLoa_idx` TO `precatorio_anoLoa_idx`;

-- RenameIndex
ALTER TABLE `precatorio` RENAME INDEX `Precatorio_enteId_idx` TO `precatorio_enteId_idx`;

-- RenameIndex
ALTER TABLE `precatorio` RENAME INDEX `Precatorio_npu_tribunalId_key` TO `precatorio_npu_tribunalId_key`;

-- RenameIndex
ALTER TABLE `precatorio` RENAME INDEX `Precatorio_tribunalId_idx` TO `precatorio_tribunalId_idx`;

-- RenameIndex
ALTER TABLE `precatórioevento` RENAME INDEX `PrecatórioEvento_precatorioId_ordem_idx` TO `precatórioevento_precatorioId_ordem_idx`;

-- RenameIndex
ALTER TABLE `rcl` RENAME INDEX `Rcl_ano_idx` TO `rcl_ano_idx`;

-- RenameIndex
ALTER TABLE `rcl` RENAME INDEX `Rcl_enteId_ano_tipo_key` TO `rcl_enteId_ano_tipo_key`;

-- RenameIndex
ALTER TABLE `rcl` RENAME INDEX `Rcl_enteId_idx` TO `rcl_enteId_idx`;

-- RenameIndex
ALTER TABLE `saldoconta` RENAME INDEX `SaldoConta_competencia_idx` TO `saldoconta_competencia_idx`;

-- RenameIndex
ALTER TABLE `saldoconta` RENAME INDEX `SaldoConta_enteId_competencia_key` TO `saldoconta_enteId_competencia_key`;

-- RenameIndex
ALTER TABLE `tribunal` RENAME INDEX `Tribunal_sigla_idx` TO `tribunal_sigla_idx`;

-- RenameIndex
ALTER TABLE `tribunal` RENAME INDEX `Tribunal_sigla_key` TO `tribunal_sigla_key`;

-- RenameIndex
ALTER TABLE `tribunal` RENAME INDEX `Tribunal_tipo_idx` TO `tribunal_tipo_idx`;

-- RenameIndex
ALTER TABLE `tribunal` RENAME INDEX `Tribunal_uf_idx` TO `tribunal_uf_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
