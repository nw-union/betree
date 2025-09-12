import { match } from "ts-pattern";
import {
  type InferSelectModel,
  type InferInsertModel,
  eq,
  and,
  desc,
  asc,
  inArray,
} from "drizzle-orm";
import { contentTable, type EntryStatusDbEnum, entryTable } from "./schema";
import type { AppError } from "../../error";
import { fromPromise, okAsync, Result, type ResultAsync } from "neverthrow";
import { dbErrorHandling } from "./util";
import type {
  DraftEntry,
  Entry,
  NonContentEntry,
  PublishedEntry,
} from "../../domain/Entry/type";
import type { Entry as EntryDto } from "../../schema/dto";
import {
  newEntryId,
  newString1To100,
  newUrl,
  newUrlOrNone,
} from "../../domain/vo";
import type { Logger } from "../../logger";
import type { EntryRepositoryPort } from "../../domain/Entry/port";
import type { SearchEntryQuery } from "../../schema/entry";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type EntrySelectModel = InferSelectModel<typeof entryTable>;
type EntryInsertModel = InferInsertModel<typeof entryTable>;
type ContentSelectModel = InferSelectModel<typeof contentTable>;

type EntryJoinSelectModel = {
  entry: EntrySelectModel;
  contents: ContentSelectModel[];
};

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
/**
 * Entry または Entry[] を EntryInsertModel[] に変換する
 */
const convToEntryInsertModelList = (e: Entry | Entry[]): EntryInsertModel[] => {
  const entries = Array.isArray(e) ? e : [e];
  return entries.map(convToEntryInsertModel);
};

/**
 * Entry を EntryInsertModel に変換する
 */
const convToEntryInsertModel = (entry: Entry): EntryInsertModel => ({
  entryId: entry.id,
  title: entry.title,
  description: entry.description,
  status: convToEntryStatusDbEnum(entry),
  imageUrl: entry.imageUrl ?? "", // null の場合は空文字にする
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

const convToEntryStatusDbEnum = (e: Entry): EntryStatusDbEnum =>
  match(e.type)
    .with("NonContentEntry", (): EntryStatusDbEnum => "draft")
    .with("DraftEntry", (): EntryStatusDbEnum => "draft")
    .with("PublishedEntry", (): EntryStatusDbEnum => "public")
    .exhaustive();

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type / DTO -> DTO)
// ----------------------------------------------------------------------------
const validateEntry = (
  joinEntry: EntryJoinSelectModel,
): Result<Entry, AppError> =>
  match(joinEntry)
    // FIXME: 表現を変える
    .with({ contents: [] }, validateNonContentEntry)
    .with({ entry: { status: "draft" } }, validateDraftEntry)
    .with({ entry: { status: "public" } }, validatePublishedEntry)
    .exhaustive();

const validateNonContentEntry = (
  e: EntryJoinSelectModel,
): Result<NonContentEntry, AppError> =>
  Result.combine([
    newEntryId(e.entry.entryId),
    newString1To100(e.entry.title, "Title"),
    newString1To100(e.entry.description, "Description"),
    newUrlOrNone(e.entry.imageUrl, "ImageUrl"),
  ]).map(([id, title, description, imageUrl]) => ({
    type: "NonContentEntry",
    id,
    title,
    description,
    imageUrl,
    createdAt: e.entry.createdAt,
    updatedAt: e.entry.updatedAt,
  }));

const validateDraftEntry = (
  e: EntryJoinSelectModel,
): Result<DraftEntry, AppError> =>
  Result.combine([
    newEntryId(e.entry.entryId),
    newString1To100(e.entry.title, "Title"),
    newString1To100(e.entry.description, "Description"),
  ]).map(([id, title, description]) => ({
    type: "DraftEntry",
    id,
    title,
    description,
    imageUrl: newUrl(e.entry.imageUrl, "ImageUrl").unwrapOr(null), // url でない場合は null 扱い
    createdAt: e.entry.createdAt,
    updatedAt: e.entry.updatedAt,
  }));

const validatePublishedEntry = (
  e: EntryJoinSelectModel,
): Result<PublishedEntry, AppError> =>
  Result.combine([
    newEntryId(e.entry.entryId),
    newString1To100(e.entry.title, "Title"),
    newString1To100(e.entry.description, "Description"),
    newUrlOrNone(e.entry.imageUrl, "ImageUrl"),
  ]).map(([id, title, description, imageUrl]) => ({
    type: "PublishedEntry",
    id,
    title,
    description,
    imageUrl,
    createdAt: e.entry.createdAt,
    updatedAt: e.entry.updatedAt,
  }));

const validateEntryDtoList = (joinEntry: EntryJoinSelectModel[]): EntryDto[] =>
  joinEntry.map(validateEntryDto);

const validateEntryDto = (g: EntryJoinSelectModel): EntryDto => ({
  entryId: g.entry.entryId,
  title: g.entry.title,
  description: g.entry.description,
  status: g.entry.status,
  imageUrl: g.entry.imageUrl,
  contents: g.contents.map((content) => ({
    contentId: content.contentId,
    title: content.title,
    author: content.author,
  })),
  createdAt: g.entry.createdAt,
});

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
// EntryInsertModel のリストを DB に保存する
const upsertEntryInsertModelList =
  (db: AnyD1Database, log: Logger) =>
  (entries: EntryInsertModel[]): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 upsertEntryInsertModelList 開始");
        log.info(`保存対象エントリ数: ${entries.length}`);

        if (entries.length === 0) {
          log.info("保存対象のエントリがありません");
          return undefined;
        }

        // エントリIDのリストを作成
        const entryIds = entries.map((entry) => entry.entryId);

        // 既存のデータがあれば削除するクエリ発行
        const delQuery = drizzle(db)
          .delete(entryTable)
          .where(inArray(entryTable.entryId, entryIds));
        log.debug(`SQL: ${delQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${delQuery.toSQL().params}`);

        // データを挿入するクエリ発行
        const insertQuery = drizzle(db).insert(entryTable).values(entries);
        log.debug(`SQL: ${insertQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${insertQuery.toSQL().params}`);

        // クエリ実行 (batch を使い, 1トランザクションで実行)
        await drizzle(db).batch([delQuery, insertQuery]);

        log.info("💽 upsertEntryInsertModelList 完了");
        return undefined;
      })(),
      dbErrorHandling,
    );

const readEntryJoinSelectModel =
  (db: AnyD1Database, log: Logger) =>
  (id: string): ResultAsync<EntryJoinSelectModel, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 readEntryJoinSelectModel 開始");

        // クエリ発行
        const query = drizzle(db)
          .select()
          .from(entryTable)
          .leftJoin(contentTable, eq(entryTable.entryId, contentTable.entryId))
          .where(eq(entryTable.entryId, id))
          .orderBy(desc(entryTable.createdAt), asc(contentTable.createdAt)); // createdAt でソート
        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // クエリ実行
        const row = await query.all();

        // TODO: NotFound をエラーハンドリング

        return groupByEntry(row)[0]; // ID で絞り込んでいるので1件のみとなるはず
      })(),
      dbErrorHandling,
    );

const readDraftEntrySelectModel =
  (db: AnyD1Database, log: Logger) =>
  (id: string): ResultAsync<EntryJoinSelectModel, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 readEntryJoinSelectModel 開始");

        // クエリ発行
        const query = drizzle(db)
          .select()
          .from(entryTable)
          .leftJoin(contentTable, eq(entryTable.entryId, contentTable.entryId))
          .where(
            and(eq(entryTable.entryId, id), eq(entryTable.status, "draft")),
          )
          .orderBy(desc(entryTable.createdAt), asc(contentTable.createdAt)); // createdAt でソート
        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // クエリ実行
        const row = await query.all();

        // TODO: NotFound をエラーハンドリング

        return groupByEntry(row)[0]; // ID で絞り込んでいるので1件のみとなるはず
      })(),
      dbErrorHandling,
    );

const searchEntryJoinSelectModelList =
  (db: AnyD1Database, log: Logger) =>
  (q: SearchEntryQuery): ResultAsync<EntryJoinSelectModel[], AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 searchEntryJoinSelectModelList 開始");

        // クエリ発行
        const query = drizzle(db)
          .select()
          .from(entryTable)
          .leftJoin(contentTable, eq(entryTable.entryId, contentTable.entryId))
          .orderBy(desc(entryTable.createdAt), asc(contentTable.createdAt)); // createdAt でソート

        // クエリに条件を追加
        if (q.entryStatusList) {
          query.where(inArray(entryTable.status, q.entryStatusList));
        }
        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // クエリ実行
        const row = await query.all();

        return groupByEntry(row);
      })(),
      dbErrorHandling,
    );

/**
 * DB から取得したデータを Entry 毎にまとめる
 *
 * ```
 * [
 *   {Entry_A, Content_X},
 *   {Entry_A, Content_Y},
 *   {Entry_B, Content_Z},
 *   {Entry_C, null},
 * ]
 * ```
 * ↑ という形で DB から取得されるので,
 * ```
 * [
 *  {Entry_A, [Content_X, Content_Y]},
 *  {Entry_B, [Content_Z]},
 *  {Entry_C, []},
 * ]
 * ```
 * のように, Entry 毎にまとめた形に変形する
 *
 */
const groupByEntry = (
  joinEntries: {
    entry: EntrySelectModel;
    content: ContentSelectModel | null;
  }[],
): EntryJoinSelectModel[] =>
  joinEntries.reduce((acc: EntryJoinSelectModel[], curr) => {
    // entry がすでに存在するかを確認
    const existingEntry = acc.find(
      // contentId で比較
      (h) => h.entry.entryId === curr.entry.entryId,
    );

    if (existingEntry) {
      // 既存の entry があれば、content 配列に追加
      if (curr.content) {
        existingEntry.contents.push(curr.content);
      }
    } else {
      // 新しい entry を作成
      acc.push({
        entry: curr.entry,
        contents: curr.content ? [curr.content] : [],
      });
    }
    return acc;
  }, []);

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newEntryRepository = (
  db: AnyD1Database,
  log: Logger,
): EntryRepositoryPort => ({
  upsertEntry: (e) =>
    okAsync(e)
      .map(convToEntryInsertModelList)
      .andThen(upsertEntryInsertModelList(db, log)),

  // deleteEntry:

  readEntry: (id) =>
    okAsync(id)
      .andThen(readEntryJoinSelectModel(db, log))
      .andThen(validateEntry),

  readDraftEntry: (id) =>
    okAsync(id)
      // string -> GroupedEntryJoinSelectModel
      .andThen(readDraftEntrySelectModel(db, log))
      // GroupedEntryJoinSelectModel -> DraftEntry
      .andThen(validateDraftEntry),

  getEntry: (id) =>
    okAsync(id)
      .andThen(readEntryJoinSelectModel(db, log))
      .map(validateEntryDto),

  searchEntry: (q) =>
    okAsync(q)
      .andThen(searchEntryJoinSelectModelList(db, log))
      .map(validateEntryDtoList),
});
