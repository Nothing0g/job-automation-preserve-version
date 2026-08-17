ALTER TABLE `jobs` ADD `contextMode` enum('full','limited') DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `contactEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `jobs` ADD `sourceUrl` varchar(2000);