import { expect, setSystemTime, test } from "bun:test";
import { createIcalEvent } from "./create-ical-event";

test("base case TZ UTC", () => {
  const now = new Date("June 15, 2025, 12:34:56 UTC");
  setSystemTime(now);

  const start = new Date("July 17, 2025, 13:00:00 UTC");
  const end = new Date("July 17, 2025, 14:00:00 UTC");

  expect(
    createIcalEvent({
      id: "123-456",
      summary: "Event title",
      description: "Event description",
      start,
      end,
      location: "Event location",
    }).toString(),
  ).toEqual(
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//sebbo.net//ical-generator//EN\r\nMETHOD:REQUEST\r\nNAME:Event Calendar\r\nX-WR-CALNAME:Event Calendar\r\nBEGIN:VEVENT\r\nUID:123-456\r\nSEQUENCE:0\r\nDTSTAMP:20250615T123456Z\r\nDTSTART:20250717T130000Z\r\nDTEND:20250717T140000Z\r\nSUMMARY:Event title\r\nLOCATION:Event location\r\nDESCRIPTION:Event description\r\nEND:VEVENT\r\nEND:VCALENDAR`,
  );
});

test("base case TZ +1", () => {
  const now = new Date("June 15, 2025, 12:34:56 +1");
  setSystemTime(now);

  const start = new Date("July 17, 2025, 13:00:00 +1");
  const end = new Date("July 17, 2025, 14:00:00 +1");

  expect(
    createIcalEvent({
      id: "123-456",
      summary: "Event title",
      description: "Event description",
      start,
      end,
      location: "Event location",
    }).toString(),
  ).toEqual(
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//sebbo.net//ical-generator//EN\r\nMETHOD:REQUEST\r\nNAME:Event Calendar\r\nX-WR-CALNAME:Event Calendar\r\nBEGIN:VEVENT\r\nUID:123-456\r\nSEQUENCE:0\r\nDTSTAMP:20250615T113456Z\r\nDTSTART:20250717T120000Z\r\nDTEND:20250717T130000Z\r\nSUMMARY:Event title\r\nLOCATION:Event location\r\nDESCRIPTION:Event description\r\nEND:VEVENT\r\nEND:VCALENDAR`,
  );
});
