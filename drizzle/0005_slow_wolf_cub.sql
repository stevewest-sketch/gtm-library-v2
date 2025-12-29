CREATE TABLE "homepage_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_title" text DEFAULT 'GTM Hub' NOT NULL,
	"hero_subtitle" text DEFAULT 'Your central hub for selling, supporting, and growing with Gladly.' NOT NULL,
	"show_hero" boolean DEFAULT true,
	"show_hub_cards" boolean DEFAULT true,
	"hub_cards_order" jsonb DEFAULT '["coe","content","enablement"]'::jsonb,
	"featured_board_id" uuid,
	"featured_board_enabled" boolean DEFAULT true,
	"featured_board_max_items" integer DEFAULT 3,
	"featured_board_title_override" text,
	"featured_board_description_override" text,
	"featured_board_icon" text DEFAULT '🎯',
	"recently_added_enabled" boolean DEFAULT true,
	"recently_added_max_items" integer DEFAULT 6,
	"recently_added_new_threshold_days" integer DEFAULT 7,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "homepage_config" ADD CONSTRAINT "homepage_config_featured_board_id_boards_id_fk" FOREIGN KEY ("featured_board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;