import { createSignup } from "./create-signup";
import { createUser } from "./create-user";
import { deleteSignup } from "./delete-signup";
import { getEventDetails } from "./get-event-detail";
import { getEventsByDay } from "./get-events-by-day";
import { loginUser } from "./login-user";
import { getUpcomingEventsForCurrentUser } from "./get-upcoming-events-for-current-user";

export const server = {
  createUser,
  loginUser,
  deleteSignup,
  createSignup,
  getEventsByDay,
  getUpcomingEventsForCurrentUser,
  getEventDetails,
};
