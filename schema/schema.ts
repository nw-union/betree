import type { AppError } from "../lib/error";
import type { ResultAsync } from "neverthrow";
import { newType } from "../lib/zod.ts";
import z from "zod";

// ----------------------------------------------------------------
// DTO
// ----------------------------------------------------------------
/**
 * Event イベント
 */
export interface Event {
  // イベント ID
  eventId: string;
  // タイトル
  title: string;
  // カテゴリ
  category: EventCategory;
  // 詳細（テキスト）
  description: string;
  // 開催日時
  eventAt: Date; // FIXME
  // チケット発売日
  ticketReleaseAt: Date; // FIXME
  // メンバーと参加ステータスのリスト
  members: { member: Member; status: Attendance }[];
}

/**
 * EventForm イベントフォーム
 */
export interface EventForm {
  // タイトル
  title: string;
  // カテゴリ
  category: EventCategory;
  // 詳細（テキスト）
  description: string;
  // 開催日時
  eventAt: Date; // FIXME
  // チケット発売日
  ticketReleaseAt: Date; // FIXME
}

/**
 * イベントカテゴリ Enum
 */
const eventCategory = z.enum([
  "music", // 音楽ライブ
  "talk", // トークライブ
  "theater", // 演劇
  "movie", // 映画
  "festival", // フェス
]);
export type EventCategory = z.infer<typeof eventCategory>;
export const allEventCategory = eventCategory.options;
export const newEventCategory = newType(eventCategory, "EventCategory");

/**
 * 参加ステータス Enum
 */
const attendance = z.enum([
  "want", // 行きたい
  "going", // 行く
]);
export type Attendance = z.infer<typeof attendance>;
export const allAttendance = attendance.options;
export const newAttendance = newType(attendance, "Attendance");

/**
 * Member メンバー
 */
export interface Member {
  // Email
  email: string;
  // アイコン画像 URL
  iconUrl?: URL;
}

// ----------------------------------------------------------------
// Event WorkFlow
// ----------------------------------------------------------------
export interface EventWorkFlows {
  // イベントを作成する
  create(cmd: CreateEventCmd): ResultAsync<CreateEvevtEvt, AppError>;
  // イベントを更新する
  update(cmd: UpdateEventCmd): ResultAsync<UpdateEventEvt, AppError>;
  // 紐づきステータス更新する
  updateMemberStatus(
    cmd: UpdateMemberStatusCmd,
  ): ResultAsync<UpdateMemberStatusEvt, AppError>;

  // イベントを見る
  read(q: ReadEventQuery): ResultAsync<Event, AppError>;
  // エントリを探す
  // search(q: SearchEventQuery): ResultAsync<Event[], AppError>;
  search(): ResultAsync<Event[], AppError>;
}

// CreateEvent コマンド
export type CreateEventCmd = {
  form: EventForm;
  memberId: string; // 作成するメンバーのID
};

// CreateEvent イベント
export type CreateEvevtEvt = {
  eventId: string;
};

// UpdateEvent コマンド
export type UpdateEventCmd = {
  id: string; // 編集するイベントのID
  form: EventForm;
};

// UpdateEvent イベント
export type UpdateEventEvt = undefined;

// UpdateMemberStatus コマンド
export type UpdateMemberStatusCmd = {
  eventId: string;
  status: Attendance | "not"; // "not" は参加しない // FIXME
  memberId: string;
};

// UpdateMemberStatus イベント
export type UpdateMemberStatusEvt = undefined;

// ReadEvent クエリ
export type ReadEventQuery = {
  id: string;
};

// SearchEvent クエリ
// export type SearchEventQuery = {};

// ----------------------------------------------------------------
// Member WorkFlow
// ----------------------------------------------------------------
export interface MemberWorkFlows {
  // メンバー情報を更新する
  update(cmd: UpdateMemberCmd): ResultAsync<UpdateMemberEvt, AppError>;

  // メンバー情報を見る
  me(): ResultAsync<Member, AppError>;
}

// UpdateMember コマンド
export type UpdateMemberCmd = {
  iconUrl: URL;
};

// UpdateMember イベント
export type UpdateMemberEvt = undefined;
