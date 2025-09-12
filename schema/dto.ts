import { z } from "zod";
import { newType } from "../lib/zod";

/**
 * Entry 記事
 */
export interface Entry {
  // 記事 ID
  entryId: string;

  // タイトル. 例: "Weekly Contents #1"
  title: string;

  // 記事の説明. 例: "2023.12.13 - 2023.12.19"
  description: string;

  // ステータス
  status: EntryStatus;

  // 画像 URL
  imageUrl: string;

  // コンテンツ
  contents: {
    // コンテンツ ID
    contentId: string;
    // タイトル
    title: string;
    // 作者
    author: string;
  }[];

  // 作成日時
  createdAt: Date;
}

/**
 * EntryForm 記事入力項目
 */
export interface EntryForm {
  // タイトル. 例: "Weekly Contents #1"
  title: string;

  // 記事の説明. 例: "2023.12.13 - 2023.12.19"
  description: string;

  // 画像 URL
  imageUrl: string;
}

/*
 * 記事のステータス Enum
 * 公開 or 下書き
 */
const entryStatus = z.enum([
  "public", // 公開
  "draft", // 下書き
]);
export type EntryStatus = z.infer<typeof entryStatus>;
export const allEntryStatus = entryStatus.options;
export const newEntryStatus = newType(entryStatus, "EntryStatus");

/**
 * Content コンテンツ
 */
export type Content = {
  // コンテンツ ID
  contentId: string;

  // 記事 ID
  entryId: string;

  // タイトル
  title: string;

  // 作者
  author: string;

  // カテゴリ
  category: Category;

  // Element (コンテンツ要素) のリスト
  elements: Element[];
};

/**
 * ContentForm コンテンツ入力項目
 */
export type ContentForm = {
  // 記事 ID
  entryId: string;
  // タイトル
  title: string;
  // 作者
  author: string;
  // カテゴリ
  category: Category;
  // コンテンツ要素のリスト
  elements: {
    type: ElementType;
    value: string;
  }[];
};

/**
 * カテゴリ(コンテンツの種類) Enum
 */
const category = z.enum([
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
export type Category = z.infer<typeof category>;
export const allCategory = category.options;
export const newCategory = newType(category, "Category");

/**
 * コンテンツ要素
 */
export interface Element {
  type: ElementType;
  value: string;
}

/**
 * コンテンツ要素種類 Enum
 */
const entryType = z.enum([
  "text",
  "youtube",
  "spotify",
  "x",
  "image",
  "link",
  "audio",
  "video",
]);
export type ElementType = z.infer<typeof entryType>;
export const allElementType = entryType.options;
export const newElementType = newType(entryType, "ElementType");
