import type { Route } from "./+types/list.ts";
import { data } from "react-router";

export async function loader({ context }: Route.LoaderArgs) {
  const { log, eventWorkFlows } = context;
  log.info("🔄 EventListPage Loader");

  return await eventWorkFlows.search().match(
    (events) => data({ events }),
    (e) => {
      throw data({ error: e.message }, { status: 500 });
    },
  );
}

export default function EventListPage({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;

  return (
    <div>
      <h1>イベント一覧</h1>
      {events.length === 0 ? (
        <p>イベントがありません</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.eventId}>
              <h2 className="font-bold text-2xl mt-5">{event.title}</h2>
              <p>カテゴリ: {event.category}</p>
              <p>{event.description}</p>
              <p>開催日時: {new Date(event.eventAt).toLocaleString("ja-JP")}</p>
              <p>
                チケット発売日:{" "}
                {new Date(event.ticketReleaseAt).toLocaleString("ja-JP")}
              </p>
              <p>参加者数: {event.members.length}人</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
