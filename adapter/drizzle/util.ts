import { P, match } from "ts-pattern";
import { AppError, DatabaseError } from "../../lib/error";

export const dbErrorHandling = (e: unknown): AppError =>
  match(e)
    .with(P.instanceOf(AppError), (e) => e)
    .with(P.instanceOf(Error), (e) => new DatabaseError(e.message, [], e))
    .otherwise((e) => new DatabaseError(`database unknown error. error: ${e}`));
