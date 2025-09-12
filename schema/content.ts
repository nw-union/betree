import type { ResultAsync } from "neverthrow";
import type { AppError } from "../error";
import type { Content, ContentForm, EntryStatus } from "./dto";

export interface ContentWorkFlows {
  // コンテンツを書く
  write(cmd: WriteContentCmd): ResultAsync<WriteContentEvt, AppError>;
  // コンテンツを編集する
  update(cmd: UpdateContentCmd): ResultAsync<UpdateContentEvt, AppError>;
  // コンテンツを削除する
  delete(cmd: DeleteContentCmd): ResultAsync<DeleteContentEvt, AppError>;
  // コンテンツを見る
  read(q: ReadContentQuery): ResultAsync<ReadContentEvt, AppError>;
  // コンテンツを探す
  search(q: SearchContentQuery): ResultAsync<SearchContentEvt, AppError>;
}

// WriteContent コマンド
export type WriteContentCmd = {
  form: ContentForm;
};

// WriteContent イベント
export type WriteContentEvt = {
  contentId: string;
};

// UpdateContent コマンド
export type UpdateContentCmd = {
  id: string; // 編集するコンテンツのID
  form: ContentForm;
};

// UpdateContent イベント
export type UpdateContentEvt = undefined;

// SearchContent クエリ
export type SearchContentQuery = {
  entryIdList?: string[];
  entryStatusList?: EntryStatus[];
};

// SearchContent イベント
export type SearchContentEvt = {
  contents: Content[];
};

// ReadContent クエリ
export type ReadContentQuery = { id: string };

// ReadContent イベント
export type ReadContentEvt = { content: Content };

// DeleteContent コマンド
export type DeleteContentCmd = { id: string };

// DeleteContent イベント
export type DeleteContentEvt = undefined;
