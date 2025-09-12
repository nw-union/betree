/*
  DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
*/
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// helper
const zEnum = <T extends z.ZodEnum>(src: string, schema: T) =>
  text(src, { enum: schema.options as [string, ...string[]] }).$type<
    z.infer<T>
  >();

// ----------------------------------------------------------------------------
// Entry Table
// ----------------------------------------------------------------------------
// status カラムの値
const entryStatusDbEnum = z.enum(["public", "draft"]);
export type EntryStatusDbEnum = z.infer<typeof entryStatusDbEnum>;

// Entry テーブルのスキーマ
export const entryTable = sqliteTable(
  "entry",
  {
    entryId: text("entry_id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: zEnum("status", entryStatusDbEnum).notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // インデックス設定
    index("idx_created_at").on(table.createdAt),
  ],
);

// ----------------------------------------------------------------------------
// Content Table
// ----------------------------------------------------------------------------
// category カラムの値
const contentCategoryDbEnum = z.enum([
  "music",
  "movie",
  "book",
  "food",
  "tv",
  "idol",
  "event",
  "radio",
  "other",
]);
export type ContentCategoryDbEnum = z.infer<typeof contentCategoryDbEnum>;

// Content テーブルのスキーマ
export const contentTable = sqliteTable(
  "content",
  {
    contentId: text("content_id").primaryKey().notNull(),
    entryId: text("entry_id").notNull(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    category: zEnum("category", contentCategoryDbEnum).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // インデックス設定
    index("idx_entry_id").on(table.entryId),
  ],
);

// ----------------------------------------------------------------------------
// Element table
// ----------------------------------------------------------------------------
// type カラムの値
const elementTypeDbEnum = z.enum([
  "text",
  "image",
  "link",
  "audio",
  "video",
  "youtube",
  "spotify",
  "x",
]);
export type ElementTypeDbEnum = z.infer<typeof elementTypeDbEnum>;

// Element テーブルのスキーマ
export const elementTable = sqliteTable(
  "element",
  {
    elementId: text("element_id").primaryKey().notNull(),
    contentId: text("content_id").notNull(),
    value: text("value").notNull(),
    type: zEnum("type", elementTypeDbEnum).notNull(),
    orderNum: integer("order_num").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // インデックス設定
    index("idx_element_content_id_order_num").on(
      table.contentId,
      table.orderNum,
    ),
  ],
);
