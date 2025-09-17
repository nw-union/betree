import type { Route } from "./+types/create.ts";

export async function loader({ context }: Route.LoaderArgs) {
  const { log } = context;
  log.info("🔄 EventCreatePage Loader");
}

export default function EventCreatePage() {
  return (
    <div>
      <h1>イベント作成</h1>
      <p>新しいイベントを作成します</p>
    </div>
  );
}
