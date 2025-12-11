import { OtelMetrics } from "../otel";

export class ApiRequest {
  private static instance: ApiRequest;

  private constructor() {}

  public static getInstance(): ApiRequest {
    if (!ApiRequest.instance) {
      ApiRequest.instance = new ApiRequest();
    }
    return ApiRequest.instance;
  }

  /**
   * Wraps a Next.js API handler to automatically track request count and duration.
   * Works with any handler signature.
   */
  public run<T extends any[], R extends Promise<any>>(
    route: string,
    handler: (...args: T) => R,
  ) {
    return async (...args: T) => {
      const start = Date.now();
      try {
        const res: any = await handler(...args);
        const durationSeconds = (Date.now() - start) / 1000;

        // Extract request and status if available
        const req = args[0] as Request | any;
        const status = (res?.status ?? 200) as number;

        OtelMetrics.trackRequest({
          route,
          method: req.method ?? "GET",
          statusCode: status,
          durationSeconds,
        });

        return res;
      } catch (err) {
        const req = args[0] as Request | any;
        const durationSeconds = (Date.now() - start) / 1000;

        OtelMetrics.trackRequest({
          route,
          method: req.method ?? "GET",
          statusCode: 500,
          durationSeconds,
        });

        throw err;
      }
    };
  }
}
