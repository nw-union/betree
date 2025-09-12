CREATE TABLE `content` (
	`content_id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `element` (
	`element_id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`order_num` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entry` (
	`entry_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reference` (
	`reference_id` text PRIMARY KEY NOT NULL,
	`from_content_id` text NOT NULL,
	`to_content_id` text NOT NULL,
	`description` text NOT NULL,
	`author` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entry_id` ON `content` (`entry_id`);--> statement-breakpoint
CREATE INDEX `idx_element_content_id_order_num` ON `element` (`content_id`,`order_num`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `entry` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_from_content_id` ON `reference` (`from_content_id`);--> statement-breakpoint
CREATE INDEX `idx_to_content_id` ON `reference` (`to_content_id`);