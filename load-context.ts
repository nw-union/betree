import type { AppLoadContext } from "react-router";
import { newLogger, type Logger } from "./logger";
import type { EventWorkFlows, MemberWorkFlows } from "./schema/schema";
import { mockEventWorkFlows, mockMemberWorkFlows } from "./schema/mock";

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
    eventWorkFlows: EventWorkFlows;
    memberWorkFlows: MemberWorkFlows;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const { cloudflare } = context;
  const log = newLogger(cloudflare.env.LOG_LEVEL, cloudflare.env.LOG_FORMAT);

  return {
    cloudflare,
    log,
    eventWorkFlows: mockEventWorkFlows,
    memberWorkFlows: mockMemberWorkFlows,
  };
}

// Dependency Injection -----------------------------------
//
//const createLinePort = (env: CloudflareEnvironment, log: Logger): LinePort =>
//  match(env.LINE_ADAPTER)
//    .with("mock", () => newLineMock(log))
//    // .with("api", () => newLine(env.LINE_ACCESS_TOKEN, log))
//    .exhaustive();
