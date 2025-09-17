import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // イベント一覧
  index("./routes/event/list.tsx"),
  // イベント作成
  route("event/create", "./routes/event/create.tsx"),
  // イベント更新
  route("event/update/:id", "./routes/event/update.tsx"),
  // イベント詳細
  // TODO

  // マイページ
  route("me", "./routes/member/me.tsx"),

  // auth
  route("signin", "routes/signin.ts"),
  route("signout", "routes/signout.ts"),
] satisfies RouteConfig;
