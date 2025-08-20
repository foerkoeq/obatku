-- AlterTable
ALTER TABLE `qr_code_masters` ADD COLUMN `updated_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `qr_code_sequences` ADD COLUMN `last_generated` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'EXHAUSTED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `total_generated` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `submissions` ADD COLUMN `activity_date` DATETIME(3) NULL,
    ADD COLUMN `activity_type` ENUM('PEST_CONTROL', 'SURVEILLANCE', 'EMERGENCY_RESPONSE', 'TRAINING_DEMO', 'FIELD_INSPECTION') NULL,
    ADD COLUMN `requested_by` VARCHAR(191) NULL,
    ADD COLUMN `urgency_reason` TEXT NULL,
    MODIFY `letter_number` VARCHAR(191) NULL,
    MODIFY `letter_date` DATETIME(3) NULL,
    MODIFY `letter_file_url` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `qr_code_data` (
    `id` VARCHAR(191) NOT NULL,
    `qr_code_string` VARCHAR(50) NOT NULL,
    `qr_code_image` TEXT NULL,
    `medicine_stock_id` VARCHAR(191) NULL,
    `is_bulk_package` BOOLEAN NOT NULL DEFAULT false,
    `components` JSON NOT NULL,
    `batch_info` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `generated_by` VARCHAR(191) NOT NULL,
    `printed_at` DATETIME(3) NULL,
    `printed_by` VARCHAR(191) NULL,
    `scanned_count` INTEGER NOT NULL DEFAULT 0,
    `last_scanned_at` DATETIME(3) NULL,
    `last_scanned_by` VARCHAR(191) NULL,
    `status` ENUM('GENERATED', 'PRINTED', 'DISTRIBUTED', 'SCANNED', 'USED', 'EXPIRED', 'INVALID') NOT NULL DEFAULT 'GENERATED',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qr_code_data_qr_code_string_key`(`qr_code_string`),
    INDEX `qr_code_data_qr_code_string_idx`(`qr_code_string`),
    INDEX `qr_code_data_medicine_stock_id_idx`(`medicine_stock_id`),
    INDEX `qr_code_data_generated_by_idx`(`generated_by`),
    INDEX `qr_code_data_status_idx`(`status`),
    INDEX `qr_code_data_generated_at_idx`(`generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_code_scan_logs` (
    `id` VARCHAR(191) NOT NULL,
    `qr_code_id` VARCHAR(191) NOT NULL,
    `scanned_by` VARCHAR(191) NOT NULL,
    `scanned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `location` VARCHAR(255) NULL,
    `device_info` TEXT NULL,
    `purpose` ENUM('VERIFICATION', 'DISTRIBUTION', 'INVENTORY_CHECK', 'TRANSACTION', 'AUDIT') NOT NULL,
    `result` ENUM('SUCCESS', 'INVALID_FORMAT', 'NOT_FOUND', 'EXPIRED', 'ALREADY_USED', 'ERROR') NOT NULL,
    `notes` TEXT NULL,

    INDEX `qr_code_scan_logs_qr_code_id_idx`(`qr_code_id`),
    INDEX `qr_code_scan_logs_scanned_by_idx`(`scanned_by`),
    INDEX `qr_code_scan_logs_scanned_at_idx`(`scanned_at`),
    INDEX `qr_code_scan_logs_purpose_idx`(`purpose`),
    INDEX `qr_code_scan_logs_result_idx`(`result`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qr_code_masters` ADD CONSTRAINT `qr_code_masters_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_data` ADD CONSTRAINT `qr_code_data_medicine_stock_id_fkey` FOREIGN KEY (`medicine_stock_id`) REFERENCES `medicine_stocks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_data` ADD CONSTRAINT `qr_code_data_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_data` ADD CONSTRAINT `qr_code_data_printed_by_fkey` FOREIGN KEY (`printed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_data` ADD CONSTRAINT `qr_code_data_last_scanned_by_fkey` FOREIGN KEY (`last_scanned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_scan_logs` ADD CONSTRAINT `qr_code_scan_logs_qr_code_id_fkey` FOREIGN KEY (`qr_code_id`) REFERENCES `qr_code_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_scan_logs` ADD CONSTRAINT `qr_code_scan_logs_scanned_by_fkey` FOREIGN KEY (`scanned_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
