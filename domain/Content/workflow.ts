import type { ContentWorkFlows } from "../../schema/content";
import { okAsync, ResultAsync } from "neverthrow";
import { newContentId } from "../vo";
import { createContent, updateContent, validateContentForm } from "./logic";
import type { ContentRepositoryPort } from "./port";
import type { TimePort } from "../ports";

export const newContentWorkFlows = (
  r: ContentRepositoryPort,
  t: TimePort,
): ContentWorkFlows => ({
  /**
   * コンテンツを書く
   *
   */
  write: ({ form }) =>
    ResultAsync.combine([
      okAsync(form)
        // Step 1. 入力バリデーション: ContentFormDto -> ValidatedContentform
        .andThen(validateContentForm),
      t.getNow(),
    ])
      // Step 2. コンテンツ新規作成: ValidatedContentform -> Content
      .map(createContent)
      // Step 3. DB に保存: Content -> void
      .andThrough(r.upsertContent)
      // Step 4. イベント発行: Content -> WriteContentEvt
      .map((content) => ({ contentId: content.id })),

  /**
   * コンテンツを編集する
   *
   */
  update: ({ id, form }) =>
    ResultAsync.combine([
      // Step 1-1. DB から現在のコンテンツを取得: string -> ContentId -> Content
      okAsync(id)
        .andThen(newContentId)
        .andThen(r.readContent),
      // Step 1-2. 入力バリデーション: ContentForm -> ValidatedContentform
      okAsync(form).andThen(validateContentForm),
      // Step 1-3. 現在の時刻を取得: void -> Date
      t.getNow(),
    ])
      // Step 2. コンテンツ編集: [Content, ValidatedContentform, Date] -> Content
      .map(updateContent)
      // Step 3. DB に保存: Content -> void
      .andThen(r.upsertContent),

  /**
   * コンテンツを削除する
   *
   */
  delete: ({ id }) =>
    okAsync(id)
      // Step 1. 入力バリデーション: string -> ContentId
      .andThen(newContentId)
      // Step 2. DB から Content を取得: ContentId -> Content
      .andThen(r.readContent)
      // Step 3. DB から削除: Content -> void
      .andThen(r.deleteContent),

  /**
   * コンテンツを見る
   *
   */
  read: ({ id }) =>
    okAsync(id)
      // Step 1. 入力バリデーション: string -> ContentId
      .andThen(newContentId)
      // Step 2. DB から Content を取得: ContentId -> ContentDto
      .andThen(r.getContent)
      // Step 3. イベント発行: ContentDto -> ReadContentEvt
      .map((content) => ({ content })),

  /**
   * コンテンツを探す
   *
   */
  search: (q) =>
    okAsync(q)
      // Step 1. DBからContentDtoを検索: SearchContentListQuery -> ContentDto[]
      .andThen(r.searchContent)
      // Step 2. イベント発行: ContentDto[] -> SearchContentEvt
      .map((contents) => ({ contents })),
});
