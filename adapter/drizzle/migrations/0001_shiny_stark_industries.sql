PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_content` (
	`content_id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_content`("content_id", "entry_id", "title", "author", "category", "created_at", "updated_at") SELECT "content_id", "entry_id", "title", "author", "category", "created_at", "updated_at" FROM `content`;--> statement-breakpoint
DROP TABLE `content`;--> statement-breakpoint
ALTER TABLE `__new_content` RENAME TO `content`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_entry_id` ON `content` (`entry_id`);