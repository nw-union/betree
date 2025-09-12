import { err, ok, Result } from "neverthrow";
import type {
  Category as CategoryDto,
  ContentForm as ContentFormDto,
  Element as ElementDto,
} from "../../schema/dto.ts";
import type {
  AudioElement,
  Category,
  Content,
  Element,
  ImageElement,
  LinkElement,
  SpotifyElement,
  TextElement,
  ValidatedContentForm,
  VideoElement,
  XElement,
  YoutubeElement,
} from "./type.ts";
import {
  mergeValidationError,
  type ValidationError,
  type AppError,
} from "../../lib/error.ts";
import { createContentId, newEntryId, newString1To100, newUrl } from "../vo.ts";
import { match } from "ts-pattern";

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * ContentFormDto を ValidatedContentForm に変換
 *
 * @param form - ContentFormDto (コンテンツ入力項目)
 * @return Result<ValidatedContentForm, ValidationError> (検証済みコンテンツ入力項目 or ValidationError)
 *
 */
export const validateContentForm = (
  form: ContentFormDto,
): Result<ValidatedContentForm, ValidationError> =>
  Result.combineWithAllErrors([
    newEntryId(form.entryId), // エントリIDを検証 (string -> EntryId)
    newString1To100(form.title, "Title"), // タイトルを検証 (string -> String1To100)
    Result.combine(form.elements.map(validateElement)), // Element[] を検証 (ElementDto[] -> Element[])
  ]).match(
    // 全ての検証が成功した場合, 検証済みコンテンツ入力項目に詰めて返す
    ([entryId, title, elements]) =>
      ok({
        entryId,
        title,
        author: form.author,
        category: validateCategory(form.category),
        elements,
      }),
    // いずれかの検証が失敗した場合, エラーをマージして, ValidationError を返す
    (es) => err(mergeValidationError(es)),
  );

/**
 * Category(DTO) を Category(DomainType) に変換
 *
 * @param c - Category(DTO) (カテゴリ)
 * @return Category
 *
 */
export const validateCategory = (c: CategoryDto): Category =>
  match(c)
    .with("music", (): "Music" => "Music")
    .with("movie", (): "Movie" => "Movie")
    .with("book", (): "Book" => "Book")
    .with("food", (): "Food" => "Food")
    .with("tv", (): "Tv" => "Tv")
    .with("idol", (): "Idol" => "Idol")
    .with("event", (): "Event" => "Event")
    .with("radio", (): "Radio" => "Radio")
    .with("other", (): "Other" => "Other")
    .exhaustive();

/**
 * ElementDto を Element に変換
 *
 * @param e - ElementDto
 * @return Element
 *
 */
const validateElement = (e: ElementDto): Result<Element, AppError> =>
  match(e.type)
    // Text の場合
    .with(
      "text",
      (): Result<TextElement, AppError> =>
        ok({ type: "TextElement", value: e.value }),
    )
    // Image の場合
    .with(
      "image",
      (): Result<ImageElement, AppError> =>
        newUrl(e.value, "Element Image").map((url) => ({
          type: "ImageElement",
          value: url,
        })),
    )
    // Video の場合
    .with(
      "video",
      (): Result<VideoElement, AppError> =>
        newUrl(e.value, "Element Video").map((url) => ({
          type: "VideoElement",
          value: url,
        })),
    )
    // Audio の場合
    .with(
      "audio",
      (): Result<AudioElement, AppError> =>
        newUrl(e.value, "Element Audio").map((url) => ({
          type: "AudioElement",
          value: url,
        })),
    )
    // Link の場合
    .with(
      "link",
      (): Result<LinkElement, AppError> =>
        newUrl(e.value, "Element Link").map((url) => ({
          type: "LinkElement",
          value: url,
        })),
    )
    // Youtube の場合
    .with(
      "youtube",
      (): Result<YoutubeElement, AppError> =>
        newUrl(e.value, "Element Youtube").map((url) => ({
          type: "YoutubeElement",
          value: url,
        })),
    )
    // Spotify の場合
    .with(
      "spotify",
      (): Result<SpotifyElement, AppError> =>
        newUrl(e.value, "Element Spotify").map((url) => ({
          type: "SpotifyElement",
          value: url,
        })),
    )
    // X の場合
    .with(
      "x",
      (): Result<XElement, AppError> =>
        newUrl(e.value, "Element X").map((url) => ({
          type: "XElement",
          value: url,
        })),
    )
    .exhaustive();

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * Content を新規作成
 *
 * @param now - 現在日時
 * @param form - ValidatedContentForm (検証済みコンテンツ入力項目)
 * @return Content
 *
 * Logic Rule:
 * - id は新規作成される
 * - createdAt と updatedAt は現在日時に設定される
 * - その他の項目は form に従って設定される
 *
 */
export const createContent = ([form, now]: [
  ValidatedContentForm,
  Date,
]): Content => ({
  ...form,
  type: "Content",
  id: createContentId(),
  createdAt: now,
  updatedAt: now,
});

/**
 * Content を更新
 *
 * @param now - 現在日時
 * @param content - Content (更新前のコンテンツ)
 * @param form - ValidatedContentForm (検証済みコンテンツ入力項目)
 * @return Content (更新後のコンテンツ)
 *
 * Logic Rule:
 * - content の内容を form で上書きする
 * - updatedAt を現在日時で更新する
 *
 */
export const updateContent = ([content, form, now]: [
  Content,
  ValidatedContentForm,
  Date,
]): Content => ({
  ...content,
  ...form,
  updatedAt: now,
});

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし
