import { okAsync } from "neverthrow";
import type {
  EventWorkFlows,
  MemberWorkFlows,
  Event,
  Member,
  CreateEvevtEvt,
  UpdateEventEvt,
  UpdateMemberStatusEvt,
  UpdateMemberEvt,
} from "./schema";

export const mockEventWorkFlows: EventWorkFlows = {
  create: (_cmd) => {
    const result: CreateEvevtEvt = {
      eventId: "550e8400-e29b-41d4-a716-446655440000",
    };
    return okAsync(result);
  },

  update: (_cmd) => {
    const result: UpdateEventEvt = undefined;
    return okAsync(result);
  },

  updateMemberStatus: (_cmd) => {
    const result: UpdateMemberStatusEvt = undefined;
    return okAsync(result);
  },

  read: (_q) => {
    const event: Event = {
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Mock Event Title",
      category: "music",
      description: "This is a mock event description",
      eventAt: new Date("2025-01-01T19:00:00Z"),
      ticketReleaseAt: new Date("2024-12-01T10:00:00Z"),
      members: [
        {
          member: {
            email: "user1@example.com",
            iconUrl: new URL("https://example.com/icon1.png"),
          },
          status: "going",
        },
        {
          member: {
            email: "user2@example.com",
            iconUrl: new URL("https://example.com/icon2.png"),
          },
          status: "want",
        },
      ],
    };
    return okAsync(event);
  },

  search: () => {
    const events: Event[] = [
      {
        eventId: "550e8400-e29b-41d4-a716-446655440000",
        title: "Mock Event 1",
        category: "music",
        description: "First mock event",
        eventAt: new Date("2025-01-01T19:00:00Z"),
        ticketReleaseAt: new Date("2024-12-01T10:00:00Z"),
        members: [
          {
            member: {
              email: "user1@example.com",
              iconUrl: new URL("https://example.com/icon1.png"),
            },
            status: "going",
          },
        ],
      },
      {
        eventId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        title: "Mock Event 2",
        category: "talk",
        description: "Second mock event",
        eventAt: new Date("2025-02-15T14:00:00Z"),
        ticketReleaseAt: new Date("2025-01-15T10:00:00Z"),
        members: [
          {
            member: {
              email: "user2@example.com",
              iconUrl: new URL("https://example.com/icon2.png"),
            },
            status: "want",
          },
        ],
      },
      {
        eventId: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
        title: "Mock Event 3",
        category: "theater",
        description: "Third mock event",
        eventAt: new Date("2025-03-20T18:30:00Z"),
        ticketReleaseAt: new Date("2025-02-20T10:00:00Z"),
        members: [
          {
            member: {
              email: "user3@example.com",
            },
            status: "want",
          },
        ],
      },
    ];
    return okAsync(events);
  },
};

export const mockMemberWorkFlows: MemberWorkFlows = {
  update: (_cmd) => {
    const result: UpdateMemberEvt = undefined;
    return okAsync(result);
  },

  me: () => {
    const member: Member = {
      email: "mockuser@example.com",
      iconUrl: new URL("https://example.com/mock-icon.png"),
    };
    return okAsync(member);
  },
};
