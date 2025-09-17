import { err, ok, Result } from "neverthrow";
import type { EntryForm } from "../../schema/dto.ts";
import type {
  DraftEntry,
  Entry,
  NonContentEntry,
  PublishedEntry,
  ValidatedEntryForm,
} from "./type.ts";
import { mergeValidationError, type AppError } from "../../lib/error.ts";
import { createEntryId, newString1To100, newUrlOrNone } from "../vo.ts";

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * EntryFormDto を ValidatedEntryForm に変換
 *
 * @param form - EntryFormDto (エントリ入力項目)
 * @return Result<ValidatedEntryForm, ValidationError> (検証済みエントリ入力項目 or ValidationError)
 *
 */
export const validateEntryForm = (
  form: EntryForm,
): Result<ValidatedEntryForm, AppError> =>
  Result.combineWithAllErrors([
    newString1To100(form.title, "Title"), // タイトルを検証 (string -> String1To100)
    newString1To100(form.description, "Description"), // エントリの説明を検証 (string -> String1To100)
    newUrlOrNone(form.imageUrl, "ImageUrl"), // 画像 URL を検証 (string -> Url | null)
  ]).match(
    // 全ての検証が成功した場合, 検証済みエントリ入力項目に詰めて返す
    ([title, description, imageUrl]) =>
      ok({
        title,
        description,
        imageUrl,
      }),
    // いずれかの検証が失敗した場合, エラーをマージして, ValidationError を返す
    (es) => err(mergeValidationError(es)),
  );

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * Entry を新規作成
 *
 * @param form - ValidatedEntryForm (検証済みエントリ入力項目)
 * @param now - 現在日時
 * @return NonContentEntry
 *
 * Logic Rule:
 * - 新規作成されるエントリは NonContentEntry である
 * - id は新規作成される
 * - createdAt と updatedAt は現在日時に設定される
 * - その他の項目は form に従って設定される
 *
 */
export const createEntry = ([form, now]: [
  ValidatedEntryForm,
  Date,
]): NonContentEntry => ({
  ...form,
  type: "NonContentEntry",
  id: createEntryId(),
  createdAt: now,
  updatedAt: now,
});

/**
 * Entry を更新
 *
 * @param entry - Entry
 * @param form - ValidatedEntryForm (検証済みエントリ入力項目)
 * @param now - 現在日時
 * @return Entry
 *
 * Logic Rule:
 * - entry の内容を form で上書きする
 * - updatedAt を現在日時に更新する
 *
 */
export const updateEntry = ([entry, form, now]: [
  Entry,
  ValidatedEntryForm,
  Date,
]): Entry => ({
  ...entry,
  ...form,
  updatedAt: now,
});

/**
 * Entry を公開
 *
 * @param entry - DraftEntry (下書き状態のエントリ)
 * @param now - 現在日時
 * @return PublishedEntry (公開されているエントリ)
 *
 * Logic Rule:
 * - DraftEntry を PublishedEntry に変換する
 * - updatedAt を現在日時に更新する
 *
 */
export const publishEntry = ([entry, now]: [
  DraftEntry,
  Date,
]): PublishedEntry => ({
  ...entry,
  type: "PublishedEntry",
  updatedAt: now,
});

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし
