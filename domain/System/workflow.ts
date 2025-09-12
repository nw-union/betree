import type { SyatemWorkFlows } from "../../schema/system";
import type { StoragePort } from "../ports";
import { okAsync } from "neverthrow";

export const newSystemWorkFlows = (storage: StoragePort): SyatemWorkFlows => ({
  /**
   * ファイルをアップロードする
   *
   */
  uploadFile: ({ file }) =>
    okAsync(file)
      // Step 1. アップロードする: Blob -> string
      .andThen(storage.putObject)
      // Step 2. イベント発行: string -> UploadFileEvt
      .map((url) => ({ url })),
});
