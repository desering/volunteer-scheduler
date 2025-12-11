import type { Meter } from "@opentelemetry/api";
import { metrics } from "@opentelemetry/api";

interface TrackRequest {
  route: string; // normalized path e.g. /api/events/[id]
  method: string; // GET, POST, etc.
  statusCode: number; // response status
  durationSeconds?: number; // measured request duration
}

class Metrics {
  private static instance: Metrics;
  private meter: Meter;

  // Metrics
  private requestCounter: ReturnType<Meter["createCounter"]>;
  private requestDuration: ReturnType<Meter["createHistogram"]>;

  private constructor() {
    this.meter = metrics.getMeter("volunteer-scheduler");

    // Counter for total HTTP requests
    this.requestCounter = this.meter.createCounter("http_requests_total", {
      description: "Total HTTP requests",
    });

    // Histogram for request durations
    this.requestDuration = this.meter.createHistogram(
      "http_request_duration_seconds",
      {
        description: "Duration of HTTP requests in seconds",
        unit: "s",
      },
    );
  }

  public static getInstance(): Metrics {
    if (!Metrics.instance) {
      Metrics.instance = new Metrics();
    }
    return Metrics.instance;
  }

  /**
   * Tracks an HTTP request.
   * @param params.route Normalized route like /api/events/[id]
   * @param params.method HTTP method (GET, POST, etc.)
   * @param params.statusCode Response status
   * @param params.durationSeconds Optional request duration in seconds
   */
  public trackRequest({
    route,
    method,
    statusCode,
    durationSeconds,
  }: TrackRequest) {
    // Increment request count
    this.requestCounter.add(1, {
      route,
      method,
      status_code: String(statusCode),
    });

    // Record duration if provided
    if (durationSeconds !== undefined) {
      this.requestDuration.record(durationSeconds, {
        route,
        method,
        status_code: String(statusCode),
      });
    }
  }
}

export const OtelMetrics = Metrics.getInstance();
