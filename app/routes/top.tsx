import type { Route } from "./+types/top.ts";

/**
 * トップページ loader
 *
 * 実行するWorkFlow
 * - searchEntryWorkFlow: エントリを探す
 *
 */
// export const loader: LoaderFunction = async ({ context }) => {
export async function loader({ context }: Route.LoaderArgs) {
  //const { log, entryWorkFlows } = context;
  log.info("🔄 トップページ Loader");

  //// コマンド作成
  //const query: SearchEntryQuery = { entryStatusList: ["public"] }; // 公開中のエントリを取得
  //log.debug(`SearchEntryQuery: ${JSON.stringify(query)}`);

  //// WorkFlow 実行: エントリを探す
  //return await entryWorkFlows.search(query).match(
  //  (evt) => evt,
  //  (e) => {
  //    log.error("searchEntryWorkFlow が失敗しました", e);
  //    return { entries: [] }; // エラー時は空の配列を返す
  //  },
  //);
}

//export function meta() {
//  return createMeta({
//    title: "Weekly Contents",
//    description: Description,
//    ogpImageUrl: "https://wc.local-host.club/ogp.png",
//  });
//}

/**
 * トップページ Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  //const { entries } = loaderData;
  return (
    <>
    <h1>BeTree</h1>
    </>
  );
}
