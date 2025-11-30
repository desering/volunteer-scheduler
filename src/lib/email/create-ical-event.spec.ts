import {expect, test, vi} from "vitest";
import {createIcalEvent} from "./create-ical-event";

test("base case", () => {
  const now = new Date("June 15, 2025, 12:34:56");
  vi.setSystemTime(now);

  const start = new Date("July 17, 2025, 13:00:00");
  const end = new Date("July 17, 2025, 14:00:00");

  expect(createIcalEvent({
    id: "123-456",
    summary: "Event title",
    description: "Event description",
    start,
    end,
    location: "Event location",
  }).toString()).toEqual(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//sebbo.net//ical-generator//EN\r\nMETHOD:REQUEST\r\nNAME:De Sering\r\nX-WR-CALNAME:De Sering\r\nBEGIN:VEVENT\r\nUID:123-456\r\nSEQUENCE:0\r\nDTSTAMP:20250615T103456Z\r\nDTSTART:20250717T110000Z\r\nDTEND:20250717T120000Z\r\nSUMMARY:Event title\r\nLOCATION:Event location\r\nDESCRIPTION:Event description\r\nEND:VEVENT\r\nEND:VCALENDAR`);
});
