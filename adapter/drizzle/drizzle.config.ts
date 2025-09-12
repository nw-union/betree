import type { Config } from "drizzle-kit";

export default {
  out: "./adapter/drizzle/migrations",
  schema: "./adapter/drizzle/schema.ts",
  dialect: "sqlite",
} satisfies Config;
