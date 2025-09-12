import { match } from "ts-pattern";
import {
  type InferSelectModel,
  type InferInsertModel,
  asc,
  eq,
  inArray,
  desc,
} from "drizzle-orm";
import {
  contentTable,
  entryTable,
  elementTable,
  type ContentCategoryDbEnum,
  type ElementTypeDbEnum,
} from "./schema";
import type {
  AudioElement,
  Category,
  Content,
  Element,
  ImageElement,
  LinkElement,
  SpotifyElement,
  TextElement,
  VideoElement,
  XElement,
  YoutubeElement,
} from "../../domain/Content/type";
import {
  newContentId,
  newEntryId,
  newString1To100,
  newUrl,
} from "../../domain/vo";
import { uuidv4 } from "../../lib/uuid";
import { type AppError, NotFoundDataError } from "../../lib/error";
import { fromPromise, ok, okAsync, Result, ResultAsync } from "neverthrow";
import { dbErrorHandling } from "./util";
import type {
  Content as ContentDto,
  ElementType,
  Category as CategoryDto,
} from "../../schema/dto";
import type { Logger } from "../../logger";
import type { ContentRepositoryPort } from "../../domain/Content/port";
import type { BatchItem } from "drizzle-orm/batch";
import type { SearchContentQuery } from "../../schema/content";
import { drizzle, type AnyD1Database } from "drizzle-orm/d1";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type ContentSelectModel = InferSelectModel<typeof contentTable>;
type ContentInsertModel = InferInsertModel<typeof contentTable>;
type ElementSelectModel = InferSelectModel<typeof elementTable>;
type ElementInsertModel = InferInsertModel<typeof elementTable>;

type ContentJoinSelectModel = {
  content: ContentSelectModel;
  elements: ElementSelectModel[];
};

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
/**
 * Content または content[] の ID のみを抜き出し string[] に変換
 *
 */
const convToContentIdList = (content: Content | Content[]): string[] =>
  Array.isArray(content) ? content.map((c) => c.id) : [content.id.toString()];

/**
 * Content を ContentInsertModel に変換
 *
 * @param content - Content (Domain)
 * @return ContentInsertModel (DTO)
 *
 */
const convToContentInsertModel = (content: Content): ContentInsertModel => ({
  contentId: content.id,
  entryId: content.entryId,
  title: content.title,
  author: content.author,
  category: convToContentCategoryDbEnum(content.category),
  createdAt: content.createdAt,
  updatedAt: content.updatedAt,
});

/**
 * Category を ContentCategoryDbEnum に変換
 *
 * @param category - Category (Domain)
 * @return ContentCategoryDbEnum (DTO)
 *
 */
const convToContentCategoryDbEnum = (
  category: Category,
): ContentCategoryDbEnum =>
  match(category)
    .with("Music", (): ContentCategoryDbEnum => "music")
    .with("Movie", (): ContentCategoryDbEnum => "movie")
    .with("Book", (): ContentCategoryDbEnum => "book")
    .with("Food", (): ContentCategoryDbEnum => "food")
    .with("Tv", (): ContentCategoryDbEnum => "tv")
    .with("Idol", (): ContentCategoryDbEnum => "idol")
    .with("Event", (): ContentCategoryDbEnum => "event")
    .with("Radio", (): ContentCategoryDbEnum => "radio")
    .with("Other", (): ContentCategoryDbEnum => "other")
    .exhaustive();

/**
 * Content がもつ Element を ElementInsertModel[] に変換
 *
 * @param content - Content (Domain)
 * @return ElementInsertModel[] (DTO)
 *
 */
const convToElementTableList = (content: Content): ElementInsertModel[] =>
  content.elements.map((element, index) => ({
    elementId: uuidv4(), // ID は毎回新規発行
    contentId: content.id,
    value: element.value,
    type: convToElementType(element),
    orderNum: index,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  }));

/**
 * Element を ElementTypeDbEnum に変換
 *
 * @param element - Element (Domain)
 * @return ElementTypeDbEnum (DTO)
 *
 */
const convToElementType = (element: Element): ElementTypeDbEnum =>
  match(element.type)
    .with("TextElement", (): ElementTypeDbEnum => "text")
    .with("ImageElement", (): ElementTypeDbEnum => "image")
    .with("LinkElement", (): ElementTypeDbEnum => "link")
    .with("AudioElement", (): ElementTypeDbEnum => "audio")
    .with("VideoElement", (): ElementTypeDbEnum => "video")
    .with("YoutubeElement", (): ElementTypeDbEnum => "youtube")
    .with("SpotifyElement", (): ElementTypeDbEnum => "spotify")
    .with("XElement", (): ElementTypeDbEnum => "x")
    .exhaustive();

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type / DTO -> DTO)
// ----------------------------------------------------------------------------
/**
 * ElementSelectModel を Element (Domain) に変換
 *
 * @param e - ElementSelectModel
 * @return Result<Element, AppError> - Element (Domain) or AppError
 *
 */
const validateElement = (e: ElementSelectModel): Result<Element, AppError> =>
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
    // Link の場合
    .with(
      "link",
      (): Result<LinkElement, AppError> =>
        newUrl(e.value, "Element Link").map((url) => ({
          type: "LinkElement",
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
    // Video の場合
    .with(
      "video",
      (): Result<VideoElement, AppError> =>
        newUrl(e.value, "Element Video").map((url) => ({
          type: "VideoElement",
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
    .with(
      "x",
      (): Result<XElement, AppError> =>
        newUrl(e.value, "Element X").map((url) => ({
          type: "XElement",
          value: url,
        })),
    )
    .exhaustive();

/**
 * ContentCategoryDbEnum を Category に変換
 *
 * @param c - ContentCategoryDbEnum
 * @return Category - Category
 *
 */
const validateCategory = (c: ContentCategoryDbEnum): Category =>
  match(c)
    .with("music", (): Category => "Music")
    .with("movie", (): Category => "Movie")
    .with("book", (): Category => "Book")
    .with("food", (): Category => "Food")
    .with("tv", (): Category => "Tv")
    .with("idol", (): Category => "Idol")
    .with("event", (): Category => "Event")
    .with("radio", (): Category => "Radio")
    .with("other", (): Category => "Other")
    .exhaustive();

/**
 * ContentJoinSelectModel を Content (Domain) に変換
 *
 * @param joinSelectModel - ContentJoinSelectModel
 * @return Result<Content, AppError> - Content (Domain) or AppError
 *
 */
const validateContent = (
  joinSelectModel: ContentJoinSelectModel,
): Result<Content, AppError> =>
  Result.combine([
    newContentId(joinSelectModel.content.contentId),
    newEntryId(joinSelectModel.content.entryId),
    newString1To100(joinSelectModel.content.title, "Titile"),
    Result.combine(joinSelectModel.elements.map(validateElement)),
  ]).map(
    ([id, entryId, title, elements]): Content => ({
      type: "Content",
      id,
      entryId,
      title,
      author: joinSelectModel.content.author,
      category: validateCategory(joinSelectModel.content.category),
      elements,
      createdAt: joinSelectModel.content.createdAt,
      updatedAt: joinSelectModel.content.updatedAt,
    }),
  );

/**
 * ContentJoinSelectModel を ContentDTO に変換
 *
 * @param joinContent - ContentJoinSelectModel
 * @return Result<ContentDto, AppError> - ContentDto or AppError
 *
 */
const validateContentDto = (
  joinContent: ContentJoinSelectModel,
): ContentDto => ({
  contentId: joinContent.content.contentId,
  entryId: joinContent.content.entryId,
  title: joinContent.content.title,
  author: joinContent.content.author,
  category: validateCategoryIf(joinContent.content.category),
  elements: joinContent.elements.map(validateElementDto),
});

const validateContentDtoList = (
  joinContents: ContentJoinSelectModel[],
): ContentDto[] => joinContents.map(validateContentDto);

const validateElementDto = (
  element: ElementSelectModel,
): { type: ElementType; value: string } => ({
  type: validateElementType(element.type),
  value: element.value,
});

const validateElementType = (type: ElementTypeDbEnum): ElementType =>
  match(type)
    .with("text", (): ElementType => "text")
    .with("image", (): ElementType => "image")
    .with("link", (): ElementType => "link")
    .with("audio", (): ElementType => "audio")
    .with("video", (): ElementType => "video")
    .with("youtube", (): ElementType => "youtube")
    .with("spotify", (): ElementType => "spotify")
    .with("x", (): ElementType => "x")
    .exhaustive();

const validateCategoryIf = (category: ContentCategoryDbEnum): CategoryDto =>
  match(category)
    .with("music", (): CategoryDto => "music")
    .with("movie", (): CategoryDto => "movie")
    .with("book", (): CategoryDto => "book")
    .with("food", (): CategoryDto => "food")
    .with("tv", (): CategoryDto => "tv")
    .with("idol", (): CategoryDto => "idol")
    .with("event", (): CategoryDto => "event")
    .with("radio", (): CategoryDto => "radio")
    .with("other", (): CategoryDto => "other")
    .exhaustive();

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
// ContentInsertModel を DB に保存する
const upsertContentInsertModel =
  (db: AnyD1Database, log: Logger) =>
  (content: ContentInsertModel): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 upsertContentInsertModel 開始");

        // 既存のデータを削除するクエリ発行
        const delQuery = drizzle(db)
          .delete(contentTable)
          .where(eq(contentTable.contentId, content.contentId));
        log.debug(`SQL: ${delQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${delQuery.toSQL().params}`);

        // データを挿入するクエリ発行
        const insertQuery = drizzle(db).insert(contentTable).values(content);
        log.debug(`SQL: ${insertQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${insertQuery.toSQL().params}`);

        // クエリ実行 (batch を使い, 1トランザクションで実行)
        await drizzle(db).batch([delQuery, insertQuery]);

        return undefined;
      })(),
      dbErrorHandling,
    );

// ID でコンテンツを取得する
const readContent =
  (db: AnyD1Database, log: Logger) =>
  (contentId: string): ResultAsync<ContentJoinSelectModel, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 readContent 開始");

        // クエリ発行
        const query = drizzle(db)
          .select()
          .from(contentTable)
          .where(eq(contentTable.contentId, contentId))
          .leftJoin(
            elementTable,
            eq(contentTable.contentId, elementTable.contentId),
          )
          .orderBy(asc(contentTable.createdAt), asc(elementTable.orderNum)); // orderNum でソート
        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // クエリ実行
        const content = await query.all();

        // content が null / undefind の場合は、NotFound とする
        if (!content) {
          throw new NotFoundDataError(`content not found. id=${contentId}`);
        }

        return groupByContent(content)[0]; // ID で検索しているので、1件しか返ってこない. TODO: 確認したほうがいいかも
      })(),
      dbErrorHandling,
    );

// Content のリストを削除する
const deleteContents =
  (db: AnyD1Database, log: Logger) =>
  (contentIdList: string[]): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 deleteContents 開始");
        log.info(`削除対象コンテンツ数: ${contentIdList.length}`);

        if (contentIdList.length === 0) {
          log.info("削除対象のコンテンツがありません");
          return undefined;
        }

        // Element 削除クエリ発行
        const elementQuery = drizzle(db)
          .delete(elementTable)
          .where(inArray(elementTable.contentId, contentIdList));
        log.debug(`SQL: ${elementQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${elementQuery.toSQL().params}`);

        // Content 削除クエリ発行
        const contentQuery = drizzle(db)
          .delete(contentTable)
          .where(inArray(contentTable.contentId, contentIdList));
        log.debug(`SQL: ${contentQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${contentQuery.toSQL().params}`);

        // クエリ実行 (batch を使い, 1トランザクションで実行)
        await drizzle(db).batch([elementQuery, contentQuery]);

        log.info("💽 deleteContents 完了");
        return undefined;
      })(),
      dbErrorHandling,
    );

// ElementInsertModel を DB に保存する
// 注意: 渡された Element の contentId に紐づくデータは全て削除される
const upsertElementInsertModel =
  (db: AnyD1Database, log: Logger) =>
  (elementList: ElementInsertModel[]): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 upsertElementInsertModel 開始");

        const contentIds = elementList.map((e) => e.contentId);

        // 既存のデータを削除するクエリ発行
        const delQuery = drizzle(db)
          .delete(elementTable)
          .where(inArray(elementTable.contentId, contentIds));
        log.debug(`SQL: ${delQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${delQuery.toSQL().params}`);

        // 実行予定のクエリのリストを作成
        const queryList: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
          delQuery,
        ];

        // データを挿入するクエリ発行
        for (const element of elementList) {
          const insertQuery = drizzle(db).insert(elementTable).values(element);
          log.debug(`SQL: ${insertQuery.toSQL().sql}`);
          log.debug(`PARAMS: ${insertQuery.toSQL().params}`);
          queryList.push(insertQuery);
        }

        // クエリ実行 (batch を使い, 1トランザクションで実行)
        await drizzle(db).batch(queryList);

        return undefined;
      })(),
      dbErrorHandling,
    );

const searchContents =
  (db: AnyD1Database, log: Logger) => (q: SearchContentQuery) =>
    fromPromise(
      (async () => {
        log.info("💽 searchContents 開始");

        // クエリ作成
        const query = drizzle(db)
          .select()
          .from(contentTable)
          .innerJoin(entryTable, eq(contentTable.entryId, entryTable.entryId))
          .leftJoin(
            elementTable,
            eq(contentTable.contentId, elementTable.contentId),
          )
          .orderBy(desc(contentTable.createdAt), asc(elementTable.orderNum)); // createdAt でソート

        // クエリに条件を追加
        if (q.entryIdList) {
          query.where(inArray(contentTable.entryId, q.entryIdList));
        }
        if (q.entryStatusList) {
          query.where(inArray(entryTable.status, q.entryStatusList));
        }

        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // 実行
        const content = await query.all();

        return groupByContent(content);
      })(),
      dbErrorHandling,
    );

/**
 * DB から取得したデータを Content 毎にまとめる
 *
 * ```
 * [
 *   {Content_A, Element_X},
 *   {Content_A, Element_Y},
 *   {Content_B, Element_Z},
 *   {Content_C, null},
 * ]
 * ```
 * ↑ という形で DB から取得されるので,
 * ```
 * [
 *  {Content_A, [Element_X, Element_Y]},
 *  {Content_B, [Element_Z]},
 *  {Content_C, []},
 * ]
 * ```
 * のように, Content 毎にまとめた形に変形する
 *
 */
const groupByContent = (
  rows: {
    content: ContentSelectModel;
    element: ElementSelectModel | null;
  }[],
): ContentJoinSelectModel[] =>
  rows.reduce((acc: ContentJoinSelectModel[], curr) => {
    // content がすでに存在するかを確認
    const existingContent = acc.find(
      // contentId で比較
      (h) => h.content.contentId === curr.content.contentId,
    );

    if (existingContent) {
      // 既存の content があれば、elements 配列に追加
      if (curr.element) {
        existingContent.elements.push(curr.element);
      }
    } else {
      // 新しい content を作成
      acc.push({
        content: curr.content,
        elements: curr.element ? [curr.element] : [],
      });
    }
    return acc;
  }, []);

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newContentRepository = (
  db: AnyD1Database,
  log: Logger,
): ContentRepositoryPort => ({
  upsertContent: (content) =>
    // TODO: ここが combine で実行しているが, 同一トランザクションで実行したい
    ResultAsync.combine([
      // Content -> ContentInsertModel -DB保存-> void
      okAsync(content)
        .map(convToContentInsertModel)
        .andThen(upsertContentInsertModel(db, log)),
      // Content -> ElementInsertModel -DB保存-> void
      okAsync(content)
        .map(convToElementTableList)
        .andThen(upsertElementInsertModel(db, log)),
    ]).map(() => undefined),

  deleteContent: (content) =>
    okAsync(content).map(convToContentIdList).andThen(deleteContents(db, log)),

  readContent: (id) =>
    okAsync(id.toString())
      // Step 1. ContentJoinSelectModel 取得 (string -> ContentJoinSelectModel)
      .andThen(readContent(db, log))
      // Step 2. CpntentJoinSelectModel -> Content
      .andThen(validateContent),

  getContent: (id) =>
    okAsync(id.toString())
      // Step 1. ContentJoinSelectModel 取得 (string -> ContentJoinSelectModel)
      .andThen(readContent(db, log))
      // Step 2. CpntentJoinSelectModel -> ContentDto
      .map(validateContentDto),

  searchContent: (q) =>
    okAsync(q)
      // Step 1. ContentJoinSelectModel 取得 (SearchContentListQuery -> ContentJoinSelectModel[])
      .andThen(searchContents(db, log))
      // Step 2. CpntentJoinSelectModel[] -> ContentDto[]
      .map(validateContentDtoList),
});
