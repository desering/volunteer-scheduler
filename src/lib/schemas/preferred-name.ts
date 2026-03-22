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
  .min(1, "Preferred name is required")
  .max(50, "Preferred name must not exceed 50 characters")
  .regex(/^[^,]*$/, "Preferred name cannot contain commas")
  .transform((name) => name.trim());
