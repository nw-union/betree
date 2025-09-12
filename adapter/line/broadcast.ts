import { fromPromise, okAsync, type ResultAsync } from "neverthrow";
import { type AppError, NotImplementedYetError } from "../../lib/error";
import type { Entry as EntryDto } from "../../schema/dto";
import type { Logger } from "../../logger";
import { dbErrorHandling } from "../drizzle/util"; // FIXME
import type { LinePort } from "../../domain/Entry/port";
import { toShortUuid } from "../../lib/uuid";

// FIXME!!!!!
export const shortUuid = (uuid: string) => toShortUuid(uuid).unwrapOr(uuid);

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------
const createBroadcastMessage = (entry: EntryDto): string => {
  let message = `${entry.title}を更新しました!🧻\n\n-- Outline --\n`;
  for (const content of entry.contents) {
    message += `${content.title}\n`;
  }
  message += `\n-- URL --\nhttps://wc.local-host.club/wc/${shortUuid(entry.entryId)}`;
  return message;
};

// ----------------------------------------------------------------------------
// Adapter Logic
// ----------------------------------------------------------------------------
const postLineMessageBloadcast =
  (token: string, log: Logger) =>
  (message: string): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.debug("postLineMessageBloadcast 開始");

        // Line Message API にリクエストを送信
        const res = await fetch(
          "https://api.line.me/v2/bot/message/broadcast",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              messages: [
                {
                  type: "text",
                  text: message,
                },
              ],
            }),
          },
        );
        log.debug(`response: ${JSON.stringify(res)}`);

        if (!res.ok) {
          log.error(`postLineMessageBloadcast 失敗: ${res.status}`);
          throw new NotImplementedYetError(
            `postLineMessageBloadcast 失敗: ${res.status}`,
          ); // FIXME:
        }

        return undefined;
      })(),
      dbErrorHandling, // FIXME
    );

const mockLineMessageBroadcast =
  (log: Logger) =>
  (message: string): ResultAsync<undefined, AppError> =>
    okAsync(undefined).map(() => {
      log.info(`[MOCK] 以下のメッセージを LINE で送信しました:\n${message}`);
      return undefined;
    });

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newLine = (token: string, log: Logger): LinePort => ({
  broadcastEntry: (entry) =>
    okAsync(entry)
      // 送信メッセージを作成 EntryDto -> string
      .map(createBroadcastMessage)
      // メッセージを送信 string -> n/a
      .andThen(postLineMessageBloadcast(token, log)),
});

export const newLineMock = (log: Logger): LinePort => ({
  broadcastEntry: (entry) =>
    okAsync(entry)
      .map(createBroadcastMessage)
      .andThen(mockLineMessageBroadcast(log)),
});
