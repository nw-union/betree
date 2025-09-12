import type { Route } from "./+types/fileupload.ts";
import type { LoaderFunction } from "react-router";
import { parseFormData } from "@mjackson/form-data-parser";

export const loader: LoaderFunction = () => {
  return new Response("method not allowed", { status: 405 });
};

/**
 * ファイルアップロード Action
 *
 * 実行するWorkFlow
 * - uploadFileWorkFlow: ファイルをアップロードする
 *
 */
export async function action({ context, request }: Route.ActionArgs) {
  const { log, systemWorkFlows } = context;

  log.debug("🔄 ファイルアップロード Action");

  // フォームデータからファイルを取得
  const form = await parseFormData(request, {
    maxFileSize: 1024 * 1024 * 3,
  });
  const file = form.get("file") as Blob;

  // WorkFlow 実行: ファイルをアップロードする
  return await systemWorkFlows
    .uploadFile({
      file,
    })
    .match(
      (evt) =>
        new Response(JSON.stringify(evt), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      (_e) => new Response("error", { status: 500 }),
    );
}
