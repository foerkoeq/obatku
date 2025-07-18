-- CreateTable
CREATE TABLE `qr_code_masters` (
    `id` VARCHAR(191) NOT NULL,
    `funding_source_code` VARCHAR(1) NOT NULL,
    `funding_source_name` VARCHAR(100) NOT NULL,
    `medicine_type_code` VARCHAR(1) NOT NULL,
    `medicine_type_name` VARCHAR(100) NOT NULL,
    `active_ingredient_code` VARCHAR(3) NOT NULL,
    `active_ingredient_name` VARCHAR(255) NOT NULL,
    `producer_code` VARCHAR(1) NOT NULL,
    `producer_name` VARCHAR(255) NOT NULL,
    `package_type_code` VARCHAR(1) NULL,
    `package_type_name` VARCHAR(100) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,

    INDEX `qr_code_masters_funding_source_code_idx`(`funding_source_code`),
    INDEX `qr_code_masters_medicine_type_code_idx`(`medicine_type_code`),
    INDEX `qr_code_masters_active_ingredient_code_idx`(`active_ingredient_code`),
    INDEX `qr_code_masters_producer_code_idx`(`producer_code`),
    INDEX `qr_code_masters_package_type_code_idx`(`package_type_code`),
    INDEX `qr_code_masters_status_idx`(`status`),
    UNIQUE INDEX `qr_code_masters_funding_source_code_medicine_type_code_activ_key`(`funding_source_code`, `medicine_type_code`, `active_ingredient_code`, `producer_code`, `package_type_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_code_sequences` (
    `id` VARCHAR(191) NOT NULL,
    `year` VARCHAR(2) NOT NULL,
    `month` VARCHAR(2) NOT NULL,
    `funding_source_code` VARCHAR(1) NOT NULL,
    `medicine_type_code` VARCHAR(1) NOT NULL,
    `active_ingredient_code` VARCHAR(3) NOT NULL,
    `producer_code` VARCHAR(1) NOT NULL,
    `package_type_code` VARCHAR(1) NULL,
    `current_sequence` VARCHAR(4) NOT NULL DEFAULT '0001',
    `sequence_type` ENUM('NUMERIC', 'ALPHA_SUFFIX', 'ALPHA_PREFIX') NOT NULL DEFAULT 'NUMERIC',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `qr_code_sequences_year_month_funding_source_code_medicine_ty_idx`(`year`, `month`, `funding_source_code`, `medicine_type_code`, `active_ingredient_code`, `producer_code`),
    UNIQUE INDEX `qr_code_sequences_year_month_funding_source_code_medicine_ty_key`(`year`, `month`, `funding_source_code`, `medicine_type_code`, `active_ingredient_code`, `producer_code`, `package_type_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qr_code_masters` ADD CONSTRAINT `qr_code_masters_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_sequences` ADD CONSTRAINT `qr_code_sequences_funding_source_code_medicine_type_code_ac_fkey` FOREIGN KEY (`funding_source_code`, `medicine_type_code`, `active_ingredient_code`, `producer_code`, `package_type_code`) REFERENCES `qr_code_masters`(`funding_source_code`, `medicine_type_code`, `active_ingredient_code`, `producer_code`, `package_type_code`) ON DELETE RESTRICT ON UPDATE CASCADE;
