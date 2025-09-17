import type { Route } from "./+types/me.ts";

export async function loader({ context }: Route.LoaderArgs) {
  const { log } = context;
  log.info("🔄 MyPage Loader");
}

export default function MyPage() {
  return (
    <div>
      <h1>マイページ</h1>
      <p>ユーザー情報を表示します</p>
    </div>
  );
}
