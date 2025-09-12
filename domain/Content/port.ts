import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../error.ts";
import type { Content as ContentDto } from "../../schema/dto";
import type { SearchContentQuery } from "../../schema/content";
import type { ContentId } from "../vo.ts";
import type { Content } from "./type.ts";

export interface ContentRepositoryPort {
  // upsertContent(e: Content | Content[]): ResultAsync<void, AppError>;
  upsertContent(e: Content): ResultAsync<undefined, AppError>;
  deleteContent(e: Content | Content[]): ResultAsync<undefined, AppError>;

  readContent(id: ContentId): ResultAsync<Content, AppError>;
  getContent(id: ContentId): ResultAsync<ContentDto, AppError>;

  searchContent(q: SearchContentQuery): ResultAsync<ContentDto[], AppError>;
}
