import type { AppLoadContext } from "react-router";
import { newEntryRepository } from "./adapter/drizzle/entry";
import { newContentRepository } from "./adapter/drizzle/content";
import { newTime } from "./adapter/time/now";
import { newEntryWorkFlows } from "./domain/Entry/workflow";
import { newLogger, type Logger } from "./logger";
import { newLineMock } from "./adapter/line/broadcast";
import type { EntryWorkFlows } from "./schema/entry";
import type { ContentWorkFlows } from "./schema/content";
import { newContentWorkFlows } from "./domain/Content/workflow";
import type { SyatemWorkFlows } from "./schema/system";
import { newSystemWorkFlows } from "./domain/System/workflow";
import { newStorage } from "./adapter/r2/putBucket";
import { match } from "ts-pattern";
import type { LinePort } from "./domain/Entry/port";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: Omit<ExecutionContext, "props">;
    };
    log: Logger;
    entryWorkFlows: EntryWorkFlows;
    contentWorkFlows: ContentWorkFlows;
    systemWorkFlows: SyatemWorkFlows;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const { cloudflare } = context;
  const log = newLogger(cloudflare.env.LOG_LEVEL, cloudflare.env.LOG_FORMAT);
  const time = newTime();
  const line = createLinePort(cloudflare.env, log);

  return {
    cloudflare,
    log,
    entryWorkFlows: newEntryWorkFlows(
      newEntryRepository(cloudflare.env.DB, log),
      time,
      line,
    ),
    contentWorkFlows: newContentWorkFlows(
      newContentRepository(cloudflare.env.DB, log),
      time,
    ),
    systemWorkFlows: newSystemWorkFlows(
      newStorage(cloudflare.env.BUCKET, cloudflare.env.R2_HOST, log),
    ),
  };
}

// Dependency Injection --------------------------------------------------------
//
const createLinePort = (env: CloudflareEnvironment, log: Logger): LinePort =>
  match(env.LINE_ADAPTER)
    .with("mock", () => newLineMock(log))
    // .with("api", () => newLine(env.LINE_ACCESS_TOKEN, log))
    .exhaustive();
