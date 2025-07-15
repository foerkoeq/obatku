-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PPL', 'DINAS', 'POPT') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `birth_date` DATETIME(3) NOT NULL,
    `avatar_url` VARCHAR(191) NULL,
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_nip_key`(`nip`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_nip_idx`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicines` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `producer` VARCHAR(191) NULL,
    `active_ingredient` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `supplier` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL,
    `pack_unit` VARCHAR(191) NULL,
    `quantity_per_pack` INTEGER NULL,
    `price_per_unit` DECIMAL(15, 2) NULL,
    `pest_types` JSON NULL,
    `storage_location` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `qr_code` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `medicines_qr_code_key`(`qr_code`),
    INDEX `medicines_category_idx`(`category`),
    INDEX `medicines_supplier_idx`(`supplier`),
    INDEX `medicines_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicine_stocks` (
    `id` VARCHAR(191) NOT NULL,
    `medicine_id` VARCHAR(191) NOT NULL,
    `batch_number` VARCHAR(191) NULL,
    `current_stock` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `initial_stock` DECIMAL(10, 2) NOT NULL,
    `min_stock` DECIMAL(10, 2) NOT NULL DEFAULT 10,
    `entry_date` DATETIME(3) NOT NULL,
    `expiry_date` DATETIME(3) NOT NULL,
    `supplier` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medicine_stocks_medicine_id_idx`(`medicine_id`),
    INDEX `medicine_stocks_expiry_date_idx`(`expiry_date`),
    INDEX `medicine_stocks_current_stock_idx`(`current_stock`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` VARCHAR(191) NOT NULL,
    `submission_number` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `village` VARCHAR(191) NOT NULL,
    `farmer_group` VARCHAR(191) NOT NULL,
    `group_leader` VARCHAR(191) NOT NULL,
    `commodity` VARCHAR(191) NOT NULL,
    `total_area` DECIMAL(10, 2) NOT NULL,
    `affected_area` DECIMAL(10, 2) NOT NULL,
    `pest_types` JSON NOT NULL,
    `letter_number` VARCHAR(191) NOT NULL,
    `letter_date` DATETIME(3) NOT NULL,
    `letter_file_url` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `submitter_id` VARCHAR(191) NOT NULL,
    `reviewer_id` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `reviewer_notes` TEXT NULL,
    `distributor_id` VARCHAR(191) NULL,
    `distributed_at` DATETIME(3) NULL,
    `completion_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `submissions_submission_number_key`(`submission_number`),
    INDEX `submissions_status_idx`(`status`),
    INDEX `submissions_submitter_id_idx`(`submitter_id`),
    INDEX `submissions_district_idx`(`district`),
    INDEX `submissions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_items` (
    `id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `medicine_id` VARCHAR(191) NOT NULL,
    `requested_quantity` DECIMAL(10, 2) NOT NULL,
    `approved_quantity` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `distributed_quantity` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_items_submission_id_idx`(`submission_id`),
    INDEX `submission_items_medicine_id_idx`(`medicine_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_number` VARCHAR(191) NOT NULL,
    `type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    `submission_id` VARCHAR(191) NULL,
    `reference_number` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `total_items` INTEGER NOT NULL DEFAULT 0,
    `total_value` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `processed_by` VARCHAR(191) NOT NULL,
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transactions_transaction_number_key`(`transaction_number`),
    INDEX `transactions_type_idx`(`type`),
    INDEX `transactions_status_idx`(`status`),
    INDEX `transactions_processed_at_idx`(`processed_at`),
    INDEX `transactions_transaction_number_idx`(`transaction_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `medicine_stock_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(15, 2) NULL,
    `total_price` DECIMAL(15, 2) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_items_transaction_id_idx`(`transaction_id`),
    INDEX `transaction_items_medicine_stock_id_idx`(`medicine_stock_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource_type` VARCHAR(191) NOT NULL,
    `resource_id` VARCHAR(191) NULL,
    `details` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_user_id_idx`(`user_id`),
    INDEX `activity_logs_action_idx`(`action`),
    INDEX `activity_logs_resource_type_idx`(`resource_type`),
    INDEX `activity_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicine_stocks` ADD CONSTRAINT `medicine_stocks_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_submitter_id_fkey` FOREIGN KEY (`submitter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_distributor_id_fkey` FOREIGN KEY (`distributor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_items` ADD CONSTRAINT `submission_items_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_items` ADD CONSTRAINT `submission_items_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_medicine_stock_id_fkey` FOREIGN KEY (`medicine_stock_id`) REFERENCES `medicine_stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
