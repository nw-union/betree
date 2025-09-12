import { type Result, ok } from "neverthrow";
import { z } from "zod";
import type { ValidationError } from "../error";
import { uuidv4 } from "../lib/uuid";
import { newType } from "../lib/zod";

/**
 * newVoOrNone は, ValueObjectを生成する関数を作成するためのヘルパー関数
 * 入力文字列が空文字の場合は, null. それ以外は `newVo` と同様に動作する関数を作成する
 *
 * @param schema zodのスキーマ
 * @param type VOの型名
 */
const newVoOrNone =
  <T extends z.ZodTypeAny>(schema: T, type: string) =>
  (src: unknown, name?: string): Result<z.infer<T> | null, ValidationError> =>
    src === "" ? ok(null) : newType(schema, type)(src, name);

// ----------------------------------------------------------------------------
//
/**
 * EntryId エントリID型
 *
 * UUID `z.uuidv4()`
 */
const entryId = z.uuidv4().brand("EntryId"); // UUID
export type EntryId = z.infer<typeof entryId>;
export const newEntryId = newType(entryId, "EntryId");
export const createEntryId = () => newEntryId(uuidv4())._unsafeUnwrap();

/**
 * ContentId コンテンツID型
 *
 * UUID `z.uuidv4()`
 */
const contentId = z.uuidv4().brand("ContentId"); // UUID
export type ContentId = z.infer<typeof contentId>;
export const newContentId = newType(contentId, "ContentId");
export const createContentId = () => newContentId(uuidv4())._unsafeUnwrap();

/**
 * Url URL
 *
 * `z.string().url()`
 */
const url = z.string().url().brand("Url");
export type Url = z.infer<typeof url>;
export const newUrl = newType(url, "Url");
export const newUrlOrNone = newVoOrNone(url, "Url");

/**
 * String1To100 1文字以上100文字以下の文字列が入る型
 *
 * `z.string().min(1).max(100)`
 */
const string1To100 = z.string().min(1).max(100).brand("String1To100");
export type String1To100 = z.infer<typeof string1To100>;
export const newString1To100 = newType(string1To100, "String1To100");
