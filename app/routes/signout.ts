import { redirect } from "react-router";

export async function loader() {
  // CF_Authorization クッキーを削除するレスポンスヘッダーを設定
  const headers = new Headers();

  // クッキーを削除（Max-Age=0で即座に期限切れにする）
  headers.append(
    "Set-Cookie",
    "CF_Authorization=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None", // 削除なので, None で十分
  );

  // ログアウト後はホームページにリダイレクト
  return redirect("/", { headers });
}
