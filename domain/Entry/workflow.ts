import { okAsync, ResultAsync } from "neverthrow";
import type { EntryWorkFlows } from "../../schema/entry";
import type { EntryRepositoryPort, LinePort } from "./port";
import type { TimePort } from "../ports";
import { newEntryId } from "../vo";
import {
  createEntry,
  publishEntry,
  updateEntry,
  validateEntryForm,
} from "./logic";

export const newEntryWorkFlows = (
  r: EntryRepositoryPort,
  t: TimePort,
  l: LinePort,
): EntryWorkFlows => ({
  /**
   * エントリを書く
   */
  write: ({ form }) =>
    ResultAsync.combine([
      // Step 1-1. 入力バリデーション: EntryFormDto -> ValidatedEntryForm
      okAsync(form).andThen(validateEntryForm),
      // Step 1-2. 現在時刻取得: void -> Date
      t.getNow(),
    ])
      // Step 2. コンテンツ新規作成: [ValidatedEntryForm, Date] -> NonContentEntry
      .map(createEntry)
      // Step 3. DB に保存: NonContentEntry -> void
      .andThrough(r.upsertEntry)
      // Step 4. イベント発行: EntryDto -> WriteEntryEvt
      .map((entry) => ({ entryId: entry.id })),

  /**
   * エントリを編集する
   *
   */
  update: ({ id, form }) =>
    ResultAsync.combine([
      // Step 1-1. DB から現在のエントリを取得: string -> EntryId -> Entry
      okAsync(id)
        .andThen(newEntryId)
        .andThen(r.readEntry),
      // Step 1-2. 入力バリデーション: EntryFormDto -> ValidatedEntryForm
      okAsync(form).andThen(validateEntryForm),
      // Step 1-3. 現在時刻取得: void -> Date
      t.getNow(),
    ])
      // Step 2. エントリ編集: {Entry, ValidatedEntryForm} -> Entry
      .map(updateEntry)
      // Step 3. DB に保存: Entry -> void
      .andThen(r.upsertEntry),

  /**
   * エントリを公開する
   *
   */
  publish: ({ id }) =>
    ResultAsync.combine([
      okAsync(id)
        // Step 1. 入力バリデーション: string -> EntryId
        .andThen(newEntryId)
        // Step 2. DB から下書きエントリを取得: string -> DraftEntry
        .andThen(r.readDraftEntry),
      t.getNow(),
    ])
      // Step 3. エントリ公開: DraftEntry -> PublishedEntry
      .map(publishEntry)
      // Step 4. DB に保存: Entry -> void
      .andThen(r.upsertEntry),

  /**
   * エントリをブロードキャストする
   *
   */
  bloadcast: ({ id }) =>
    okAsync(id)
      // Step 1. 入力値チェック: string -> EntryId
      .andThen(newEntryId)
      // Step 2. DB から Entry を取得: EntryId -> EntryDto
      .andThen(r.getEntry)
      // Step 3. Line にブロードキャスト: EntryDto -> void
      .andThen(l.broadcastEntry),

  /**
   * エントリを見る
   *
   */
  read: ({ id }) =>
    okAsync(id)
      // Step 1. 入力バリデーション: string -> EntryId
      .andThen(newEntryId)
      // Step 2. DB からエントリを取得: string -> EntryDto
      .andThen(r.getEntry)
      // Step 3. イベント発行: EntryDto -> ReadEntryEvt
      .map((entry) => ({ entry })),

  /**
   * エントリを探す
   *
   */
  search: (q) =>
    okAsync(q)
      // Step 1. DB からエントリを検索: SearchEntryQuery -> EntryDto[]
      .andThen(r.searchEntry)
      // Step 2. イベント発行: EntryDto[] -> SearchEntryEvt
      .map((entries) => ({ entries })),
});
