import { describe, it, expect } from "bun:test";
import type { EntryForm } from "../../schema/dto";
import {
  createEntry,
  publishEntry,
  updateEntry,
  validateEntryForm,
} from "./logic";
import type {
  DraftEntry,
  NonContentEntry,
  PublishedEntry,
  ValidatedEntryForm,
} from "./type";
import { newEntryId, newString1To100, newUrl } from "../vo";
import { ok } from "neverthrow";

const mustEntryId = (s: string) => newEntryId(s)._unsafeUnwrap();
const mustString1To100 = (s: string) => newString1To100(s)._unsafeUnwrap();
const mustUrl = (s: string) => newUrl(s)._unsafeUnwrap();

/*
const mockDraftEntry: DraftEntry = {
  type: "DraftEntry",
  id: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
  title: mustString1To100("Draft entry Title"),
  description: mustString1To100("draft entry description"),
  imageUrl: null,
  createdAt: new Date(2025, 0, 14, 12, 0, 0),
  updatedAt: new Date(2025, 0, 14, 12, 30, 0),
};
const mockPublishedEntry: PublishedEntry = {
  type: "PublishedEntry",
  id: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
  title: mustString1To100("published entry title"),
  description: mustString1To100("before published description"),
  imageUrl: null,
  createdAt: new Date(2025, 0, 14, 12, 0, 0),
  updatedAt: new Date(2025, 0, 14, 12, 30, 0),
};
*/

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type)
// ----------------------------------------------------------------------------
describe("validateEntryForm", () => {
  it("正常系", () => {
    // Given:
    const input: EntryForm = {
      title: "title",
      description: "description",
      imageUrl: "https://example.com/image.jpg",
    };
    const output: ValidatedEntryForm = {
      title: newString1To100(input.title)._unsafeUnwrap(),
      description: newString1To100(input.description)._unsafeUnwrap(),
      imageUrl: newUrl(input.imageUrl)._unsafeUnwrap(),
    };

    // When:
    const actual = validateEntryForm(input);

    // Then:
    expect(actual.isOk()).toBeTrue();
    expect(actual).toEqual(ok(output));
  });

  it("正常系: url が空のケース", () => {
    // Given:
    const input: EntryForm = {
      title: "title",
      description: "description",
      imageUrl: "", // imageUrl が空文字で送られる
    };

    // When:
    const actual = validateEntryForm(input);

    // Then:
    expect(actual.isOk()).toBeTrue();
    expect(actual._unsafeUnwrap().imageUrl).toBeNull(); // 変換後の imageUrl が null であること
  });

  it("title が空文字の場合, エラーとなる", () => {
    // Given:
    const input: EntryForm = {
      title: "", // title が空文字で送られる
      description: "description",
      imageUrl: "https://example.com/image.jpg",
    };

    // When:
    const actual = validateEntryForm(input);

    // Then:
    expect(actual.isOk()).toBeFalse(); // Error となる
  });

  it("description が101文字以上の場合, エラーとなる", () => {
    // Given:
    const input: EntryForm = {
      title: "title",
      description: "x".repeat(101), // description が 101文字以上で送られる
      imageUrl: "https://example.com/image.jpg",
    };

    // When:
    const actual = validateEntryForm(input);

    // Then:
    expect(actual.isOk()).toBeFalse(); // Error となる
  });
});

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
describe("createEntry", () => {
  it("正常系", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const inputForm: ValidatedEntryForm = {
      title: mustString1To100("title"),
      description: mustString1To100("description"),
      imageUrl: null,
    };

    // When:
    const actual = createEntry([inputForm, now]);

    // Then:
    expect(actual).toEqual({
      type: "NonContentEntry",
      id: expect.anything(), // id はランダムなのでチェックしない
      title: inputForm.title,
      description: inputForm.description,
      imageUrl: inputForm.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  });
});

describe("updateEntry", () => {
  it("正常系: NonContentEntry の場合", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const inputEntry: NonContentEntry = {
      type: "NonContentEntry",
      id: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
      title: mustString1To100("before title"),
      description: mustString1To100("before description"),
      imageUrl: mustUrl("https://example.com/before-image.jpg"),
      createdAt: new Date(2025, 0, 14, 12, 0, 0),
      updatedAt: new Date(2025, 0, 14, 12, 0, 0),
    };
    const inputForm: ValidatedEntryForm = {
      title: mustString1To100("after title"),
      description: mustString1To100("after description"),
      imageUrl: mustUrl("https://example.com/after-image.jpg"),
    };

    // When:
    const actual = updateEntry([inputEntry, inputForm, now]);

    // Then:
    expect(actual).toEqual({
      type: inputEntry.type, // type は変更しない
      id: inputEntry.id, // id は変更しない
      title: inputForm.title, // title を更新
      description: inputForm.description, // description を更新
      imageUrl: inputForm.imageUrl, // imageUrl を更新
      createdAt: inputEntry.createdAt, // createdAt は変更しない
      updatedAt: now, // updatedAt を fixedNow に更新
    });
  });

  it("正常系: PublishedEntry の場合", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const inputEntry: PublishedEntry = {
      type: "PublishedEntry",
      id: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
      title: mustString1To100("before title"),
      description: mustString1To100("before description"),
      imageUrl: mustUrl("https://example.com/before-image.jpg"),
      createdAt: new Date(2025, 0, 14, 12, 0, 0),
      updatedAt: new Date(2025, 0, 14, 12, 0, 0),
    };
    const inputForm: ValidatedEntryForm = {
      title: mustString1To100("after title"),
      description: mustString1To100("after description"),
      imageUrl: mustUrl("https://example.com/after-image.jpg"),
    };

    // When:
    const actual = updateEntry([inputEntry, inputForm, now]);

    // Then:
    expect(actual).toEqual({
      type: inputEntry.type, // type は変更しない
      id: inputEntry.id, // id は変更しない
      title: inputForm.title, // title を更新
      description: inputForm.description, // description を更新
      imageUrl: inputForm.imageUrl, // imageUrl を更新
      createdAt: inputEntry.createdAt, // createdAt は変更しない
      updatedAt: now, // updatedAt を fixedNow に更新
    });
  });
});

describe("publishEntry", () => {
  it("正常系", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const input: DraftEntry = {
      type: "DraftEntry",
      id: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
      title: mustString1To100("title"),
      description: mustString1To100("description"),
      imageUrl: null,
      createdAt: new Date(2025, 0, 14, 12, 0, 0),
      updatedAt: new Date(2025, 0, 14, 12, 30, 0),
    };

    // When:
    const actual = publishEntry([input, now]);

    // Then:
    expect(actual).toEqual({
      type: "PublishedEntry",
      id: input.id, // id は変更しない
      title: input.title, // title は変更しない
      description: input.description, // description は変更しない
      imageUrl: input.imageUrl, // imageUrl は変更しない
      createdAt: input.createdAt, // createdAt は変更しない
      updatedAt: now, // updatedAt を now に更新
    });
  });
});
