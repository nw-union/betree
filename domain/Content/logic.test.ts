import { describe, it, expect } from "bun:test";
import type { ContentForm, Category as CategoryDto } from "../../schema/dto";
import type { ValidatedContentForm, Content, Category } from "./type";
import {
  createContent,
  updateContent,
  validateCategory,
  validateContentForm,
} from "./logic";
import { newContentId, newEntryId, newString1To100, newUrl } from "../vo";

const mustContentId = (a: string) => newContentId(a)._unsafeUnwrap();
const mustEntryId = (a: string) => newEntryId(a)._unsafeUnwrap();
const mustString1To100 = (a: string) => newString1To100(a)._unsafeUnwrap();
const mustUrl = (a: string) => newUrl(a)._unsafeUnwrap();

const contentFromDtoMock: ContentForm = {
  entryId: "5e605b07-4748-49dd-b128-2550515e822a",
  title: "title",
  author: "author",
  category: "movie",
  elements: [
    { type: "text", value: "text 1" },
    { type: "text", value: "text 2" },
    { type: "link", value: "https://sample.com/url" },
    { type: "image", value: "https://sample.com/url" },
    { type: "audio", value: "https://audio.com/url" },
    { type: "video", value: "https://video.com/url" },
    { type: "youtube", value: "https://youtube.com/url" },
    { type: "spotify", value: "https://spotify.com/url" },
    { type: "x", value: "https://x.com/url" },
  ],
};
const validatedContentFormMock: ValidatedContentForm = {
  entryId: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
  title: mustString1To100("ValidatedContentForm Title"),
  author: "author",
  category: "Movie",
  elements: [
    { type: "TextElement", value: "text 1" },
    { type: "TextElement", value: "text 2" },
    { type: "LinkElement", value: mustUrl("https://sample.com/url") },
    { type: "ImageElement", value: mustUrl("https://sample.com/url") },
    { type: "AudioElement", value: mustUrl("https://audio.com/url") },
    { type: "VideoElement", value: mustUrl("https://video.com/url") },
    { type: "YoutubeElement", value: mustUrl("https://youtube.com/url") },
    { type: "SpotifyElement", value: mustUrl("https://spotify.com/url") },
    { type: "XElement", value: mustUrl("https://x.com/url") },
  ],
};

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type)
// ----------------------------------------------------------------------------
describe("validateContentForm", () => {
  it("有効値の場合, ValidatedContentForm となる", () => {
    // Given:
    const input = contentFromDtoMock;

    // When:
    const actual = validateContentForm(input);

    // Then:
    expect(actual.isOk()).toBeTrue();
    expect(actual._unsafeUnwrap()).toEqual({
      entryId: mustEntryId(input.entryId),
      title: mustString1To100(input.title),
      author: input.author,
      category: "Movie",
      elements: [
        { type: "TextElement", value: "text 1" },
        { type: "TextElement", value: "text 2" },
        { type: "LinkElement", value: mustUrl("https://sample.com/url") },
        { type: "ImageElement", value: mustUrl("https://sample.com/url") },
        { type: "AudioElement", value: mustUrl("https://audio.com/url") },
        { type: "VideoElement", value: mustUrl("https://video.com/url") },
        { type: "YoutubeElement", value: mustUrl("https://youtube.com/url") },
        { type: "SpotifyElement", value: mustUrl("https://spotify.com/url") },
        { type: "XElement", value: mustUrl("https://x.com/url") },
      ],
    });
  });

  it("title が 0 文字の場合, エラーとなる", () => {
    // Given:
    const input = { ...contentFromDtoMock, title: "" };

    // When:
    const actual = validateContentForm(input);

    // Then:
    expect(actual.isErr()).toBeTrue();
  });
});

describe("validateCategory", () => {
  // Given: Category(DTO) と Category(DomainType) の対応表
  const caseList: { input: CategoryDto; output: Category }[] = [
    { input: "music", output: "Music" },
    { input: "movie", output: "Movie" },
    { input: "book", output: "Book" },
    { input: "food", output: "Food" },
    { input: "tv", output: "Tv" },
    { input: "idol", output: "Idol" },
    { input: "event", output: "Event" },
    { input: "radio", output: "Radio" },
    { input: "other", output: "Other" },
  ];
  for (const c of caseList) {
    it(`${c.input} の場合, ${c.output} となる`, () => {
      // When:
      const actual = validateCategory(c.input);
      // Then:
      expect(actual).toEqual(c.output);
    });
  }
});

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
describe("createContent", () => {
  it("有効値の場合, Content となる", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const inputForm = validatedContentFormMock;

    // When:
    const actual = createContent([inputForm, now]);
    // Then:
    expect(actual).toEqual({
      type: "Content",
      id: expect.anything(), // id はランダムなのでチェックしない
      entryId: inputForm.entryId,
      title: inputForm.title,
      author: inputForm.author,
      category: inputForm.category,
      elements: inputForm.elements,
      createdAt: now,
      updatedAt: now,
    });
  });
});

describe("updateContent", () => {
  it("正常系", () => {
    // Given:
    const now = new Date(2025, 0, 15, 12, 0, 0);
    const inputContent: Content = {
      type: "Content",
      id: mustContentId("5e605b07-4748-49dd-b128-2550515e822a"),
      entryId: mustEntryId("5e605b07-4748-49dd-b128-2550515e822a"),
      title: mustString1To100("befor title"),
      author: "before author",
      category: "Movie",
      elements: [
        { type: "TextElement", value: "text 1" },
        {
          type: "YoutubeElement",
          value: mustUrl("https://www.youtube.com/embed/aaaaaaaaa"),
        },
      ],
      createdAt: new Date(2024, 0, 15, 12, 0, 0),
      updatedAt: new Date(2024, 0, 15, 12, 0, 0),
    };
    const inputForm: ValidatedContentForm = {
      entryId: mustEntryId("dd2c767b-7aeb-414f-a7e7-19be5e01e7fd"),
      title: mustString1To100("after title"),
      author: "author",
      category: "Other",
      elements: [
        {
          type: "YoutubeElement",
          value: mustUrl("https://www.youtube.com/embed/bbbbbbb"),
        },
        { type: "TextElement", value: "text 2" },
      ],
    };

    // When:
    const actual = updateContent([inputContent, inputForm, now]);

    // Then:
    expect(actual).toEqual({
      type: "Content",
      id: inputContent.id, // id は変更しない
      entryId: inputForm.entryId, // form のものに更新
      title: inputForm.title, // form のものに更新
      author: inputForm.author, // form のものに更新
      category: inputForm.category, // form のものに更新
      elements: inputForm.elements, // form のものに更新
      createdAt: inputContent.createdAt, // 作成日時は変更しない
      updatedAt: now, // 更新日時は現在日時(fixedNow)に更新
    });
  });
});
