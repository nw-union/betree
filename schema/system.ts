import type { ResultAsync } from "neverthrow";
import type { AppError } from "../error";

export interface SyatemWorkFlows {
  // ファイルをアップロードする
  uploadFile(cmd: UploadFileCmd): ResultAsync<UploadFileEvt, AppError>;
}

// UploadFile コマンド
export interface UploadFileCmd {
  file: Blob;
}

// UploadFile イベント
export interface UploadFileEvt {
  url: string;
}
