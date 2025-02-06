import { createSignup } from "./create-signup";
import { createUser } from "./create-user";
import { deleteSignup } from "./delete-signup";
import { getEventDetails } from "./get-event-detail";
import { getAllEventsGroupedByDate } from "./get-all-events-grouped-by-date.ts";
import { loginUser } from "./login-user";
import { getUpcomingEventsForCurrentUser } from "./get-upcoming-events-for-current-user";
import { getEventsByDate } from "~/actions/get-events-by-date.ts";

export const server = {
  createUser,
  loginUser,
  deleteSignup,
  createSignup,
  getAllEventsGroupedByDate,
  getEventsByDate,
  getUpcomingEventsForCurrentUser,
  getEventDetails,
};
