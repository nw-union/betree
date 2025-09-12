import { okAsync } from "neverthrow";
import type { TimePort } from "../..//domain/ports";

export const newTime = (): TimePort => ({
  getNow: () => okAsync(new Date()),
});
