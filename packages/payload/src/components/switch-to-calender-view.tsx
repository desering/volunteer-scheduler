"use client";

import Link from "next/link";

export const SwitchToCalenderView = (props) => {
  console.log(Object.keys(props));
  return <Link href="/admin/calender/shifts">Switch to calender view</Link>;
};
