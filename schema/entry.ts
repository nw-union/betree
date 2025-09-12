import type { ResultAsync } from "neverthrow";
import type { AppError } from "../error";
import type { Entry, EntryForm, EntryStatus } from "./dto.ts";

export interface EntryWorkFlows {
  // エントリを書く
  write(cmd: WriteEntryCmd): ResultAsync<WriteEntryEvt, AppError>;
  // エントリを編集する
  update(cmd: UpdateEntryCmd): ResultAsync<UpdateEntryEvt, AppError>;
  // エントリを公開する
  publish(cmd: PublishEntryCmd): ResultAsync<PublishEntryEvt, AppError>;
  // エントリをブロードキャストする
  bloadcast(cmd: BloadcastEntryCmd): ResultAsync<BloadcastEntryEvt, AppError>;
  // エントリを見る
  read(q: ReadEntryQuery): ResultAsync<ReadEntryEvt, AppError>;
  // エントリを探す
  search(q: SearchEntryQuery): ResultAsync<SearchEntryEvt, AppError>;
}

// WriteEntry コマンド
export type WriteEntryCmd = {
  form: EntryForm;
};

// WriteEntry イベント
export type WriteEntryEvt = {
  entryId: string;
};

// UpdateEntry コマンド
export type UpdateEntryCmd = {
  id: string; // 編集するエントリのID
  form: EntryForm;
};

// UpdateEntry イベント
export type UpdateEntryEvt = undefined;

// PublishEntry コマンド
export type PublishEntryCmd = {
  id: string;
};

// PublishEntry イベント
export type PublishEntryEvt = undefined;

// ReadEntry クエリ
export type ReadEntryQuery = {
  id: string;
};

// ReadEntry イベント
export type ReadEntryEvt = {
  entry: Entry;
};

// SearchEntry クエリ
export type SearchEntryQuery = {
  entryStatusList?: EntryStatus[];
};

// SearchEntry イベント
export type SearchEntryEvt = {
  entries: Entry[];
};

// BloadcastEntry コマンド
export type BloadcastEntryCmd = {
  id: string; // 記事ID
};

// BloadcastEntry イベント
export type BloadcastEntryEvt = undefined;
