CREATE TABLE `send_history` (
	`send_history_id` text PRIMARY KEY NOT NULL,
	`subscriber_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriber` (
	`subscriber_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_send_history_subscriber_id` ON `send_history` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `idx_send_history_entry_id` ON `send_history` (`entry_id`);