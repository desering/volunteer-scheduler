import { expect, test } from "vitest";
import {hashString} from "./hash-string";

test("empty string", async () => {
  expect((await hashString(""))).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("random words", async () => {
  expect((await hashString("Lorem ipsum dolor sit amet"))).toEqual("16aba5393ad72c0041f5600ad3c2c52ec437a2f0c7fc08fadfc3c0fe9641d7a3");
});

test("long string", async () => {
  expect((await hashString("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."))).toEqual("2d8c2f6d978ca21712b5f6de36c9d31fa8e96a4fa5d8ff8b0188dfb9e7c171bb");
});

test("two ids", async () => {
  expect((await hashString("123-456"))).toEqual("83a417f0862b66106806c595a06735f885bb90dd6b0657cc2d8dcc51df5b9e63");
});
