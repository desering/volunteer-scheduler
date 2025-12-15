import { trackRequest } from "@/utils/otel";

/**
 * Wraps a Next.js API handler to
 * - automatically track HTTP request count and duration.
 *
 * Works with any handler signature.
 */
export function runRequest<T extends any[], R extends Promise<any>>(
  route: string,
  handler: (...args: T) => R,
) {
  return async (...args: T): Promise<Awaited<R>> => {
    const start = Date.now();
    const req = args[0] as Request | any;

    try {
      const res: any = await handler(...args);
      const durationSeconds = (Date.now() - start) / 1000;

      trackRequest({
        route,
        method: req?.method ?? "GET",
        statusCode: res?.status ?? 200,
        durationSeconds,
      });

      return res;
    } catch (err) {
      const durationSeconds = (Date.now() - start) / 1000;

      trackRequest({
        route,
        method: req?.method ?? "GET",
        statusCode: 500,
        durationSeconds,
      });

      throw err;
    }
  };
}
