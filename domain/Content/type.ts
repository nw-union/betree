import type { ContentId, EntryId, String1To100, Url } from "../vo";

/*
 * Content コンテンツ
 */
export interface Content {
  type: "Content";

  // コンテンツID
  id: ContentId;

  // 紐づいているエントリのID
  entryId: EntryId;

  // タイトル
  // 1文字以上100文字以下の文字列
  title: String1To100;

  // author
  author: string;

  // カテゴリ
  category: Category;

  // エレメントのリスト
  elements: Element[];

  // 作成日時
  createdAt: Date;

  // 更新日時
  updatedAt: Date;
}

export type Category =
  | "Music"
  | "Movie"
  | "Book"
  | "Food"
  | "Tv"
  | "Idol"
  | "Event"
  | "Radio"
  | "Other";

export type Element =
  | TextElement
  | ImageElement
  | LinkElement
  | AudioElement
  | VideoElement
  | YoutubeElement
  | SpotifyElement
  | XElement;

export interface TextElement {
  type: "TextElement";
  value: string; // TODO
}

export interface ImageElement {
  type: "ImageElement";
  value: Url;
}

export interface LinkElement {
  type: "LinkElement";
  value: Url;
}

export interface AudioElement {
  type: "AudioElement";
  value: Url;
}

export interface VideoElement {
  type: "VideoElement";
  value: Url;
}

export interface YoutubeElement {
  type: "YoutubeElement";
  value: Url; // TODO
}

export interface SpotifyElement {
  type: "SpotifyElement";
  value: Url; // TODO
}

export interface XElement {
  type: "XElement";
  value: string; // TODO
}

/**
 * 検証済みコンテンツ入力項目
 */
export interface ValidatedContentForm {
  entryId: EntryId;
  title: String1To100;
  author: string;
  category: Category;
  elements: Element[];
}
