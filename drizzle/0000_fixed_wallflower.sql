CREATE TABLE "asset_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid,
	"board_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "asset_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid,
	"tag_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "board_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid,
	"tag_id" uuid,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"color" text NOT NULL,
	"light_color" text NOT NULL,
	"accent_color" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "boards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"hub" text NOT NULL,
	"format" text NOT NULL,
	"types" text[],
	"tags" text[],
	"primary_link" text NOT NULL,
	"share_link" text,
	"video_url" text,
	"slides_url" text,
	"transcript_url" text,
	"key_asset_url" text,
	"presenters" text[],
	"duration_minutes" integer,
	"event_date" timestamp,
	"takeaways" text[],
	"howtos" jsonb,
	"tips" text[],
	"page_sections" jsonb,
	"owner" text,
	"views" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"ai_confidence" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "catalog_entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"color" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "view_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid,
	"viewed_at" timestamp DEFAULT now(),
	"source" text,
	"session_id" text
);
--> statement-breakpoint
ALTER TABLE "asset_boards" ADD CONSTRAINT "asset_boards_asset_id_catalog_entries_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."catalog_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_boards" ADD CONSTRAINT "asset_boards_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_tags" ADD CONSTRAINT "asset_tags_asset_id_catalog_entries_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."catalog_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_tags" ADD CONSTRAINT "asset_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_tags" ADD CONSTRAINT "board_tags_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_tags" ADD CONSTRAINT "board_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_events" ADD CONSTRAINT "view_events_entry_id_catalog_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."catalog_entries"("id") ON DELETE no action ON UPDATE no action;