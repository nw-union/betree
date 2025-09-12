import type { EntryId, String1To100, Url } from "../vo";

// エントリの共通要素
interface _Entry {
  // エントリID
  id: EntryId;

  // タイトル
  // 1文字以上100文字以下の文字列
  // ex. "Weekly Contents #1"
  title: String1To100;

  // エントリの説明
  // 1文字以上100文字以下の文字列
  // ex. "2023.12.13 - 2023.12.19"
  description: String1To100;

  // 画像 URL
  imageUrl: Url | null;

  // 作成日時
  createdAt: Date;

  // 更新日時
  updatedAt: Date;
}

// NonContentEntry コンテンツを持たないエントリ
export interface NonContentEntry extends _Entry {
  type: "NonContentEntry";
}

// DraftEntry 下書き状態のエントリ
export interface DraftEntry extends _Entry {
  type: "DraftEntry";
}

// PublishedEntry 公開されているエントリ
export interface PublishedEntry extends _Entry {
  type: "PublishedEntry";
}

export type Entry = NonContentEntry | DraftEntry | PublishedEntry;

// 入力項目チェック済みのエントリフォーム
export interface ValidatedEntryForm {
  // タイトル
  title: String1To100;
  // エントリの説明
  description: String1To100;
  // 画像 URL
  imageUrl: Url | null;
}
