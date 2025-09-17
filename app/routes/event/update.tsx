import { useParams } from "react-router";
import type { Route } from "./+types/update.ts";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { log } = context;
  log.info(`🔄 EventUpdatePage Loader - ID: ${params.id}`);
}

export default function EventUpdatePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>イベント更新</h1>
      <p>イベントID: {id} を更新します</p>
    </div>
  );
}
