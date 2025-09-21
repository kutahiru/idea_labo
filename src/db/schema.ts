import { pgTable, text, timestamp, integer, varchar, boolean, serial, primaryKey } from 'drizzle-orm/pg-core';
import type { AdapterAccount } from '@auth/core/adapters';

export const users = pgTable('users', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const accounts = pgTable('accounts', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] })
]);

export const brainwritings = pgTable('brainwritings', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  usage_scope: varchar('usage_scope').notNull(),
  title: varchar('title').notNull(),
  theme_name: varchar('theme_name').notNull(),
  description: varchar('description'),
  invite_url: varchar('invite_url').unique(),
  is_invite_url_active: boolean('is_invite_url_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brainwriting_users = pgTable('brainwriting_users', {
  id: serial('id').primaryKey(),
  brainwriting_id: integer('brainwriting_id')
    .notNull()
    .references(() => brainwritings.id, { onDelete: 'cascade' }),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brainwriting_sheets = pgTable('brainwriting_sheets', {
  id: serial('id').primaryKey(),
  brainwriting_id: integer('brainwriting_id')
    .notNull()
    .references(() => brainwritings.id, { onDelete: 'cascade' }),
  current_user_id: text('current_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lock_expires_at: timestamp('lock_expires_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brainwriting_inputs = pgTable('brainwriting_inputs', {
  id: serial('id').primaryKey(),
  brainwriting_id: integer('brainwriting_id')
    .notNull()
    .references(() => brainwritings.id, { onDelete: 'cascade' }),
  brainwriting_sheet_id: integer('brainwriting_sheet_id')
    .notNull()
    .references(() => brainwriting_sheets.id, { onDelete: 'cascade' }),
  input_user_id: text('input_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  row_index: integer('row_index').notNull(),
  column_index: integer('column_index').notNull(),
  content: text('content'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mandala_arts = pgTable('mandala_arts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  theme_name: varchar('theme_name').notNull(),
  description: varchar('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mandala_art_inputs = pgTable('mandala_art_inputs', {
  id: serial('id').primaryKey(),
  mandala_art_id: integer('mandala_art_id')
    .notNull()
    .references(() => mandala_arts.id, { onDelete: 'cascade' }),
  row_index: integer('row_index').notNull(),
  column_index: integer('column_index').notNull(),
  content: text('content'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const osborn_checklists = pgTable('osborn_checklists', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  theme_name: varchar('theme_name').notNull(),
  description: varchar('description'),
  transfer_content: text('transfer_content'),
  apply_content: text('apply_content'),
  modify_content: text('modify_content'),
  magnify_content: text('magnify_content'),
  minify_content: text('minify_content'),
  substitute_content: text('substitute_content'),
  replace_content: text('replace_content'),
  reverse_content: text('reverse_content'),
  combine_content: text('combine_content'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const idea_categories = pgTable('idea_categories', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  idea_category_id: integer('idea_category_id')
    .notNull()
    .references(() => idea_categories.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: text('description'),
  priority: varchar('priority').notNull().default('medium'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});