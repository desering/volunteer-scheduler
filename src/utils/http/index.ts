import type { NextRequest } from "next/server";
import { OtelMetrics } from "@/utils/otel";

export type Handler<Args extends unknown[] = unknown[]> = (
  ...args: Args
) => Promise<Response>;

/**
 * Wraps a Next.js API handler to:
 * - automatically track HTTP request count and duration.
 *
 * Works with any handler signature.
 */
export function route<Args extends unknown[] = [NextRequest, unknown]>(
  routePath: string,
  handler: Handler<Args>,
) {
  return async (...args: Args): Promise<Response> => {
    const start = Date.now();
    let statusCode = 200;
    let durationSeconds: number | undefined;

    // Try to extract method if first arg looks like NextRequest
    const req = args[0] as NextRequest | undefined;

    try {
      const res = await handler(...args);

      statusCode = (res as Response)?.status ?? 200;
      durationSeconds = (Date.now() - start) / 1000;

      return res;
    } catch (err) {
      statusCode = 500;
      durationSeconds = (Date.now() - start) / 1000;

      throw err;
    } finally {
      OtelMetrics.trackRequest({
        route: routePath,
        method: req?.method ?? "GET",
        statusCode,
        durationSeconds,
      });
    }
  };
}
