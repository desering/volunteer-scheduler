import { z } from "zod";

/**
 * Validation for preferred name
 * - No commas (comma is used as list separator)
 * - Max length: 100 characters
 * - Min length: 1 character
 * - Trim whitespace
 */
export const preferredNameSchema = z
  .string()
  .refine(
    (name) => !(name.length > 0 && name.trim().length === 0),
    "Preferred name cannot consist only of whitespace(s)",
  )
  .min(1, "Preferred name is required")
  .max(50, "Preferred name must not exceed 50 characters")
  .trim()
  .refine(
    (name) => !name.includes(","),
    "Preferred name cannot contain commas",
  );
