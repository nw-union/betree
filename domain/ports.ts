import type { ResultAsync } from "neverthrow";
import type { AppError } from "../error.ts";

/**
 * 時間関連ポート
 */
export interface TimePort {
  // 現在日時取得
  getNow(): ResultAsync<Date, AppError>;
}

export interface StoragePort {
  putObject(b: Blob): ResultAsync<string, AppError>;
}
