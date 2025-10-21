CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "brainwriting_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"brainwriting_id" integer NOT NULL,
	"brainwriting_sheet_id" integer NOT NULL,
	"input_user_id" text NOT NULL,
	"row_index" integer NOT NULL,
	"column_index" integer NOT NULL,
	"content" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brainwriting_sheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"brainwriting_id" integer NOT NULL,
	"current_user_id" text,
	"lock_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brainwriting_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"brainwriting_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brainwritings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"usage_scope" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"theme_name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"invite_token" varchar(100) NOT NULL,
	"is_invite_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brainwritings_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "idea_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_category_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" varchar(1000),
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandalart_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"mandalart_id" integer NOT NULL,
	"section_row_index" integer NOT NULL,
	"section_column_index" integer NOT NULL,
	"row_index" integer NOT NULL,
	"column_index" integer NOT NULL,
	"content" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandalarts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"theme_name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "osborn_checklist_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"osborn_checklist_id" integer NOT NULL,
	"checklist_type" varchar(50) NOT NULL,
	"content" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "osborn_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"theme_name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_inputs" ADD CONSTRAINT "brainwriting_inputs_brainwriting_id_brainwritings_id_fk" FOREIGN KEY ("brainwriting_id") REFERENCES "public"."brainwritings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_inputs" ADD CONSTRAINT "brainwriting_inputs_brainwriting_sheet_id_brainwriting_sheets_id_fk" FOREIGN KEY ("brainwriting_sheet_id") REFERENCES "public"."brainwriting_sheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_inputs" ADD CONSTRAINT "brainwriting_inputs_input_user_id_users_id_fk" FOREIGN KEY ("input_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_sheets" ADD CONSTRAINT "brainwriting_sheets_brainwriting_id_brainwritings_id_fk" FOREIGN KEY ("brainwriting_id") REFERENCES "public"."brainwritings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_sheets" ADD CONSTRAINT "brainwriting_sheets_current_user_id_users_id_fk" FOREIGN KEY ("current_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_users" ADD CONSTRAINT "brainwriting_users_brainwriting_id_brainwritings_id_fk" FOREIGN KEY ("brainwriting_id") REFERENCES "public"."brainwritings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwriting_users" ADD CONSTRAINT "brainwriting_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brainwritings" ADD CONSTRAINT "brainwritings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_categories" ADD CONSTRAINT "idea_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_idea_category_id_idea_categories_id_fk" FOREIGN KEY ("idea_category_id") REFERENCES "public"."idea_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandalart_inputs" ADD CONSTRAINT "mandalart_inputs_mandalart_id_mandalarts_id_fk" FOREIGN KEY ("mandalart_id") REFERENCES "public"."mandalarts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandalarts" ADD CONSTRAINT "mandalarts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osborn_checklist_inputs" ADD CONSTRAINT "osborn_checklist_inputs_osborn_checklist_id_osborn_checklists_id_fk" FOREIGN KEY ("osborn_checklist_id") REFERENCES "public"."osborn_checklists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osborn_checklists" ADD CONSTRAINT "osborn_checklists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;