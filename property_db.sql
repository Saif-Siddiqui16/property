-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 15, 2026 at 09:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `property_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `accountName` varchar(191) NOT NULL,
  `assetType` varchar(191) NOT NULL,
  `openingBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communication`
--

CREATE TABLE `communication` (
  `id` int(11) NOT NULL,
  `type` varchar(191) NOT NULL,
  `recipient` varchar(191) NOT NULL,
  `subject` varchar(191) DEFAULT NULL,
  `message` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Sent',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE `document` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `fileUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `insurance`
--

CREATE TABLE `insurance` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `policyNumber` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `documentUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `insurance`
--

INSERT INTO `insurance` (`id`, `userId`, `provider`, `policyNumber`, `startDate`, `endDate`, `documentUrl`, `createdAt`, `updatedAt`) VALUES
(1, 3, 'State Farm', 'SF-12345', '2025-01-01 00:00:00.000', '2026-01-01 00:00:00.000', 'https://res.cloudinary.com/dw48hcxi5/image/upload/v1768458260/tenant_insurance/hrwbi1rz0hzpfu2k8d5w.jpg', '2026-01-15 19:16:15.398', '2026-01-15 19:52:41.011');

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `id` int(11) NOT NULL,
  `invoiceNo` varchar(191) NOT NULL,
  `tenantId` int(11) NOT NULL,
  `unitId` int(11) NOT NULL,
  `month` varchar(191) NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `rent` decimal(65,30) NOT NULL,
  `serviceFees` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `paymentMethod` varchar(191) DEFAULT NULL,
  `balanceDue` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `paidAmount` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`id`, `invoiceNo`, `tenantId`, `unitId`, `month`, `amount`, `rent`, `serviceFees`, `status`, `paidAt`, `createdAt`, `updatedAt`, `dueDate`, `paymentMethod`, `balanceDue`, `paidAmount`) VALUES
(1, 'INV-LEASE-00001', 4, 13, 'January 2026', 1500.000000000000000000000000000000, 1500.000000000000000000000000000000, 0.000000000000000000000000000000, 'sent', NULL, '2026-01-15 19:25:51.475', '2026-01-15 19:25:51.475', '2026-01-15 00:00:00.000', NULL, 1500.000000000000000000000000000000, 0.000000000000000000000000000000),
(2, 'INV-LEASE-00002', 6, 16, 'January 2026', 1500.000000000000000000000000000000, 1500.000000000000000000000000000000, 0.000000000000000000000000000000, 'sent', NULL, '2026-01-15 19:50:10.985', '2026-01-15 19:50:10.985', '2026-01-15 00:00:00.000', NULL, 1500.000000000000000000000000000000, 0.000000000000000000000000000000),
(3, 'INV-MAN-00003', 6, 16, 'January 2026', 14543.000000000000000000000000000000, 14520.000000000000000000000000000000, 23.000000000000000000000000000000, 'draft', NULL, '2026-01-15 19:50:34.202', '2026-01-15 19:50:34.202', NULL, NULL, 14543.000000000000000000000000000000, 0.000000000000000000000000000000);

-- --------------------------------------------------------

--
-- Table structure for table `lease`
--

CREATE TABLE `lease` (
  `id` int(11) NOT NULL,
  `unitId` int(11) NOT NULL,
  `tenantId` int(11) NOT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `monthlyRent` decimal(65,30) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `securityDeposit` decimal(65,30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lease`
--

INSERT INTO `lease` (`id`, `unitId`, `tenantId`, `startDate`, `endDate`, `status`, `monthlyRent`, `createdAt`, `updatedAt`, `securityDeposit`) VALUES
(3, 16, 6, '2026-01-15 00:00:00.000', '2026-01-31 00:00:00.000', 'Active', 1500.000000000000000000000000000000, '2026-01-15 19:49:50.243', '2026-01-15 19:50:10.968', 12.000000000000000000000000000000);

-- --------------------------------------------------------

--
-- Table structure for table `maintenancetask`
--

CREATE TABLE `maintenancetask` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `propertyId` int(11) DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `frequency` varchar(191) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `vendor` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Upcoming',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `senderId` int(11) NOT NULL,
  `receiverId` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `invoiceId` int(11) NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `method` varchar(191) NOT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property`
--

CREATE TABLE `property` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `ownerId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `property`
--

INSERT INTO `property` (`id`, `name`, `address`, `status`, `ownerId`, `createdAt`, `updatedAt`) VALUES
(1, 'Sunset Apartments', '123 Sunset Blvd, CA', 'Active', 2, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383'),
(2, 'Sbi tower', 'Not Provided', 'Active', 5, '2026-01-15 19:17:42.656', '2026-01-15 19:19:35.019');

-- --------------------------------------------------------

--
-- Table structure for table `refreshtoken`
--

CREATE TABLE `refreshtoken` (
  `id` int(11) NOT NULL,
  `token` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refreshtoken`
--

INSERT INTO `refreshtoken` (`id`, `token`, `userId`, `expiresAt`, `createdAt`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY4NTA0NjI2LCJleHAiOjE3NjkxMDk0MjZ9.mD1gW-wL_qosDMBlVy8SnatvXohtJaCnGDX_G5Y0zCY', 1, '2026-01-22 19:17:06.964', '2026-01-15 19:17:06.965'),
(2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY4NTA1MDQ3LCJleHAiOjE3NjkxMDk4NDd9._mlUqhjWlZC_9D_AiMiEYmJ8_Rnz56wAqiQH1uznhms', 1, '2026-01-22 19:24:07.638', '2026-01-15 19:24:07.643'),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY4NTA2NDk0LCJleHAiOjE3NjkxMTEyOTR9.-Hz-6rVLBF8eKHeLyMKeRFJ8P2FNBWZhyvfWVTrQba8', 1, '2026-01-22 19:48:14.069', '2026-01-15 19:48:14.071'),
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzY4NTA2NjQ3LCJleHAiOjE3NjkxMTE0NDd9.NVcFFmCrXaKcUWJAS5bDz2ztWl7lxYYNTiSlZudp9c4', 3, '2026-01-22 19:50:47.181', '2026-01-15 19:50:47.182'),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY4NTA2Nzc2LCJleHAiOjE3NjkxMTE1NzZ9.gvm5i92mdlPnIle79wxvGSJCctLzLc4eqwjnQNuGk4E', 1, '2026-01-22 19:52:56.726', '2026-01-15 19:52:56.728');

-- --------------------------------------------------------

--
-- Table structure for table `refundadjustment`
--

CREATE TABLE `refundadjustment` (
  `id` int(11) NOT NULL,
  `requestId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `tenantId` int(11) NOT NULL,
  `unitId` int(11) NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `date` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `systemsetting`
--

CREATE TABLE `systemsetting` (
  `id` int(11) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxes`
--

CREATE TABLE `taxes` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `appliesTo` varchar(50) NOT NULL DEFAULT 'Rent',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `priority` varchar(191) NOT NULL DEFAULT 'Low',
  `status` varchar(191) NOT NULL DEFAULT 'Open',
  `attachmentUrls` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `propertyId` int(11) DEFAULT NULL,
  `unitId` int(11) DEFAULT NULL,
  `category` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `date` datetime(3) NOT NULL,
  `description` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `balance` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `status` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` int(11) DEFAULT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `paymentId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `date`, `description`, `type`, `amount`, `balance`, `status`, `createdAt`, `updatedAt`, `accountId`, `invoiceId`, `paymentId`) VALUES
(1, '2026-01-15 19:25:51.483', 'Security Deposit Received - Lease 2', 'Liability', 20.000000000000000000000000000000, 20.000000000000000000000000000000, 'Completed', '2026-01-15 19:25:51.484', '2026-01-15 19:25:51.484', NULL, NULL, NULL),
(2, '2026-01-15 19:50:10.992', 'Security Deposit Received - Lease 3', 'Liability', 12.000000000000000000000000000000, 32.000000000000000000000000000000, 'Completed', '2026-01-15 19:50:10.994', '2026-01-15 19:50:10.994', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

CREATE TABLE `unit` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `propertyId` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Vacant',
  `bedrooms` int(11) NOT NULL DEFAULT 1,
  `rentAmount` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `rentalMode` enum('FULL_UNIT','BEDROOM_WISE') NOT NULL DEFAULT 'FULL_UNIT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `unit`
--

INSERT INTO `unit` (`id`, `name`, `propertyId`, `status`, `bedrooms`, `rentAmount`, `createdAt`, `updatedAt`, `rentalMode`) VALUES
(1, '101', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(2, '102', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(3, '103', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(4, '104', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(5, '105', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(6, '106', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(7, '107', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(8, '108', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(9, '109', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(10, '110', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(11, '111', 1, 'Occupied', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(12, '112', 1, 'Vacant', 2, 1200.000000000000000000000000000000, '2026-01-15 19:16:15.383', '2026-01-15 19:16:15.383', 'FULL_UNIT'),
(13, 'Unit 1', 2, 'Occupied', 1, 0.000000000000000000000000000000, '2026-01-15 19:17:42.656', '2026-01-15 19:25:51.461', 'FULL_UNIT'),
(14, 'Unit 2', 2, 'Vacant', 1, 0.000000000000000000000000000000, '2026-01-15 19:17:42.656', '2026-01-15 19:17:42.656', 'FULL_UNIT'),
(15, 'Unit 3', 2, 'Vacant', 3, 0.000000000000000000000000000000, '2026-01-15 19:18:06.151', '2026-01-15 19:18:06.151', 'BEDROOM_WISE'),
(16, 'unit 4', 2, 'Occupied', 1, 0.000000000000000000000000000000, '2026-01-15 19:48:38.544', '2026-01-15 19:50:10.974', 'FULL_UNIT');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `role` enum('ADMIN','OWNER','TENANT') NOT NULL DEFAULT 'TENANT',
  `phone` varchar(191) DEFAULT NULL,
  `type` varchar(191) DEFAULT 'Individual',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `phone`, `type`, `createdAt`, `updatedAt`) VALUES
(1, 'admin@property.com', '$2b$10$HbcV9RYWRgBzRHaEjxymDOT.zjS7UNI2RbHR9kNTJ47htKBBvHaJq', 'Super Admin', 'ADMIN', NULL, 'Individual', '2026-01-15 19:16:15.357', '2026-01-15 19:16:15.357'),
(2, 'owner@property.com', '$2b$10$HbcV9RYWRgBzRHaEjxymDOT.zjS7UNI2RbHR9kNTJ47htKBBvHaJq', 'Mr. Landlord', 'OWNER', NULL, 'Individual', '2026-01-15 19:16:15.371', '2026-01-15 19:16:15.371'),
(3, 'tenant@example.com', '$2b$10$HbcV9RYWRgBzRHaEjxymDOT.zjS7UNI2RbHR9kNTJ47htKBBvHaJq', 'John Smith', 'TENANT', '+1 (555) 012-3456', 'Individual', '2026-01-15 19:16:15.398', '2026-01-15 19:16:15.398'),
(4, 'sbit@gmail.com', '$2b$10$QnQ4MQsSpIieTYLP43m01eHpvPKB1KMTdI7YFTrYYHx/WdBvwRdnK', 'Sbi tenant', 'TENANT', '123456789', 'Individual', '2026-01-15 19:18:54.015', '2026-01-15 19:18:54.015'),
(5, 'sbiowner@gmail.com', '$2b$10$0wtV0jk.qRJFOVBso5TuheqURC.uZ6SlBRKJfOKIGNX..cJ0gm/I.', 'sbi owner', 'OWNER', '123456789', 'Individual', '2026-01-15 19:19:35.019', '2026-01-15 19:19:35.019'),
(6, 'rtte@gmail.com', '$2b$10$NLOR7qVBmSUZgbvylidLyOsW2/ixi6UzayCTberqulvT6lR/zO5h.', 'Sbi ten', 'TENANT', '123456789', 'Individual', '2026-01-15 19:49:50.237', '2026-01-15 19:49:50.237');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('290d743e-13e8-40af-bf85-33c46206a6ea', '460c0c7a9fd45749f04a272203250554846f4217e1d82222dc785a7cf6e2d772', '2026-01-15 19:15:51.576', '20260115191551_init', NULL, NULL, '2026-01-15 19:15:51.563', 1),
('2e0cdde6-313c-47a6-9baa-596548d74f26', 'da230bf5e8574f5c7a3e8d6743622dff64f54f126303ca22688d288a38d18d9e', '2026-01-15 19:15:47.693', '20260111211523_init', NULL, NULL, '2026-01-15 19:15:46.922', 1),
('9d3c0a76-4024-405b-9602-c46bdba6fc62', 'f747837fb5095d7e75072811f136a8f05876f4051bc61640b2f498784a7e27ef', '2026-01-15 19:15:48.293', '20260114192508_production_readiness_overhaul', NULL, NULL, '2026-01-15 19:15:48.110', 1),
('a0a7a449-cb48-4254-bc23-3d91fc661e22', 'ead8e5d7a48586cf30be682fbd4e48eca6aa59ab719c78da8fa358fa707c17d5', '2026-01-15 19:15:47.752', '20260112164936_init', NULL, NULL, '2026-01-15 19:15:47.696', 1),
('cd3f460f-8189-4060-a744-9754eb27baba', '4a511dee4c967cadc351786a6f719812ad62c2b6aa827f51da2280752f2c1782', '2026-01-15 19:15:47.897', '20260114011900_init', NULL, NULL, '2026-01-15 19:15:47.754', 1),
('e51b63c6-c04b-46a2-b390-0735a9114b80', 'e499badb54b59a2192d727bf14d5531f0d49f21c83b621489598b1483c21854e', '2026-01-15 19:15:47.907', '20260114022541_add_taxes_table', NULL, NULL, '2026-01-15 19:15:47.898', 1),
('edade4ae-baa7-4f3c-b931-f9db9e801fe2', '6ec49d3b2f2912d906f5e393d8f3b23bfa0bf189b8508c0af3d026349e3107bc', '2026-01-15 19:15:48.108', '20260114024812_add_accounts_table', NULL, NULL, '2026-01-15 19:15:47.908', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `communication`
--
ALTER TABLE `communication`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Document_userId_fkey` (`userId`);

--
-- Indexes for table `insurance`
--
ALTER TABLE `insurance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Insurance_userId_fkey` (`userId`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Invoice_invoiceNo_key` (`invoiceNo`),
  ADD KEY `Invoice_tenantId_fkey` (`tenantId`),
  ADD KEY `Invoice_unitId_fkey` (`unitId`);

--
-- Indexes for table `lease`
--
ALTER TABLE `lease`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Lease_unitId_fkey` (`unitId`),
  ADD KEY `Lease_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `maintenancetask`
--
ALTER TABLE `maintenancetask`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MaintenanceTask_propertyId_fkey` (`propertyId`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Message_senderId_fkey` (`senderId`),
  ADD KEY `Message_receiverId_fkey` (`receiverId`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_invoiceId_fkey` (`invoiceId`);

--
-- Indexes for table `property`
--
ALTER TABLE `property`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Property_ownerId_fkey` (`ownerId`);

--
-- Indexes for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RefreshToken_token_key` (`token`),
  ADD KEY `RefreshToken_userId_fkey` (`userId`);

--
-- Indexes for table `refundadjustment`
--
ALTER TABLE `refundadjustment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RefundAdjustment_requestId_key` (`requestId`),
  ADD KEY `RefundAdjustment_tenantId_fkey` (`tenantId`),
  ADD KEY `RefundAdjustment_unitId_fkey` (`unitId`);

--
-- Indexes for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SystemSetting_key_key` (`key`);

--
-- Indexes for table `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Ticket_userId_fkey` (`userId`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_accountId_fkey` (`accountId`),
  ADD KEY `transaction_invoiceId_fkey` (`invoiceId`),
  ADD KEY `transaction_paymentId_fkey` (`paymentId`);

--
-- Indexes for table `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Unit_propertyId_fkey` (`propertyId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `communication`
--
ALTER TABLE `communication`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `insurance`
--
ALTER TABLE `insurance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lease`
--
ALTER TABLE `lease`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `maintenancetask`
--
ALTER TABLE `maintenancetask`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property`
--
ALTER TABLE `property`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `refundadjustment`
--
ALTER TABLE `refundadjustment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemsetting`
--
ALTER TABLE `systemsetting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `unit`
--
ALTER TABLE `unit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `insurance`
--
ALTER TABLE `insurance`
  ADD CONSTRAINT `Insurance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `Invoice_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Invoice_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `lease`
--
ALTER TABLE `lease`
  ADD CONSTRAINT `Lease_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Lease_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `maintenancetask`
--
ALTER TABLE `maintenancetask`
  ADD CONSTRAINT `MaintenanceTask_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `property` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `property`
--
ALTER TABLE `property`
  ADD CONSTRAINT `Property_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `refundadjustment`
--
ALTER TABLE `refundadjustment`
  ADD CONSTRAINT `RefundAdjustment_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `RefundAdjustment_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `unit`
--
ALTER TABLE `unit`
  ADD CONSTRAINT `Unit_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `property` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
