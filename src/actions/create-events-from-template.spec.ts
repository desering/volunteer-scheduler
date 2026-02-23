import { beforeEach, describe, expect, it, mock } from "bun:test";
import { UTCDate } from "@date-fns/utc";

const mockGetPayload = mock();
const mockCreateRoles = mock();

mock.module("payload", () => ({
  getPayload: mockGetPayload,
}));

mock.module("@payload-config", () => ({
  default: {},
}));

mock.module("./create-roles", () => ({
  createRoles: mockCreateRoles,
}));

const { createEventsFromTemplate } = await import(
  "./create-events-from-template"
);
const { createRoles } = await import("./create-roles");

describe("createEventsFromTemplate", () => {
  const mockPayload = {
    findByID: mock(),
    create: mock(),
    db: {
      beginTransaction: mock(),
      commitTransaction: mock(),
      rollbackTransaction: mock(),
    },
  };

  beforeEach(() => {
    mockGetPayload.mockClear();
    mockCreateRoles.mockClear();
    mockPayload.findByID.mockClear();
    mockPayload.create.mockClear();
    mockPayload.db.beginTransaction.mockClear();
    mockPayload.db.commitTransaction.mockClear();
    mockPayload.db.rollbackTransaction.mockClear();
    mockGetPayload.mockResolvedValue(mockPayload);
  });

  it("creates events, sections, and roles from template", async () => {
    const template = {
      id: 1,
      event_title: "Test Event",
      description: "desc",
      start_time: "2026-02-15T10:00:00Z",
      end_time: "2026-02-15T12:00:00Z",
      start_time_tz: "UTC",
      tags: [{ id: "tag1" }],
      locations: [{ id: "loc1" }],
      sections: [
        {
          title: "Section 1",
          description: "Section desc",
          roles: ["role1"],
        },
      ],
      roles: ["role2"],
    };

    mockPayload.findByID.mockResolvedValue(template);
    mockPayload.db.beginTransaction.mockResolvedValue("txid");
    mockPayload.create
      .mockResolvedValueOnce({ id: "event1" }) // event
      .mockResolvedValueOnce({ id: "section1" }); // section

    const selectedDays = [new UTCDate("2026-02-20T00:00:00Z")];

    await createEventsFromTemplate(1, selectedDays);

    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: "event-templates",
      id: 1,
    });
    expect(mockPayload.create).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "events" }),
    );
    expect(mockPayload.create).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "sections" }),
    );
    expect(createRoles).toHaveBeenCalledWith(
      "event1",
      "txid",
      ["role1"],
      "section1",
    );
    expect(createRoles).toHaveBeenCalledWith("event1", "txid", ["role2"]);
    expect(mockPayload.db.commitTransaction).toHaveBeenCalledWith("txid");
  });

  it("rolls back transaction and throws on error", async () => {
    mockPayload.findByID.mockResolvedValue({
      ...{},
      sections: [],
      roles: [],
      event_title: "title",
      description: "desc",
      start_time: "2026-02-15T10:00:00Z",
      end_time: "2026-02-15T12:00:00Z",
      start_time_tz: "UTC",
    });
    mockPayload.db.beginTransaction.mockResolvedValue("txid");
    mockPayload.create.mockRejectedValueOnce(new Error("fail"));
    const selectedDays = [new UTCDate("2026-02-20T00:00:00Z")];
    await expect(createEventsFromTemplate(1, selectedDays)).rejects.toThrow(
      "fail",
    );
    expect(mockPayload.db.rollbackTransaction).toHaveBeenCalledWith("txid");
  });

  it("throws if template not found", async () => {
    mockPayload.findByID.mockResolvedValue(undefined);
    mockPayload.db.beginTransaction.mockResolvedValue("txid");
    const selectedDays = [new UTCDate("2026-02-20T00:00:00Z")];
    await expect(createEventsFromTemplate(1, selectedDays)).rejects.toThrow(
      "Template not found",
    );
  });

  it("throws if transaction fails to start", async () => {
    mockPayload.findByID.mockResolvedValue({
      event_title: "title",
      description: "desc",
      start_time: "2026-02-15T10:00:00Z",
      end_time: "2026-02-15T12:00:00Z",
      start_time_tz: "UTC",
    });
    mockPayload.db.beginTransaction.mockResolvedValue(undefined);
    const selectedDays = [new UTCDate("2026-02-20T00:00:00Z")];
    await expect(createEventsFromTemplate(1, selectedDays)).rejects.toThrow(
      "Failed to start transaction",
    );
  });
});
