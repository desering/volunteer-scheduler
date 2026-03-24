import z from "zod";

export const phoneNumber = z.e164({
  error: (issue) =>
    !issue.input
      ? "Phone number is required"
      : "Invalid phone number e.g +31612345678",
});

export const password = z.string().min(8);

export const email = z.email({
  error: (issue) =>
    !issue.input ? "Email is required" : (issue.message as string),
});
