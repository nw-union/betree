import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../error.ts";
import type { Entry as EntryDto } from "../../schema/dto";
import type { SearchEntryQuery } from "../../schema/entry";
import type { EntryId } from "../vo.ts";
import type { DraftEntry, Entry } from "./type.ts";

export interface EntryRepositoryPort {
  upsertEntry(e: Entry | Entry[]): ResultAsync<undefined, AppError>;
  // deleteEntry(e: Entry | Entry[]): ResultAsync<void, AppError>;

  readEntry(id: EntryId): ResultAsync<Entry, AppError>;
  readDraftEntry(id: EntryId): ResultAsync<DraftEntry, AppError>;

  getEntry(id: EntryId): ResultAsync<EntryDto, AppError>;
  searchEntry(q: SearchEntryQuery): ResultAsync<EntryDto[], AppError>;
}

export interface LinePort {
  broadcastEntry(e: EntryDto): ResultAsync<undefined, AppError>;
}
