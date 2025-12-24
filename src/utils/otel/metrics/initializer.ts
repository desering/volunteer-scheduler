import { meter } from "./meter";

export const requestCounter = meter.createCounter("http_requests_total", {
  description: "Total HTTP requests",
});

export const requestDuration = meter.createHistogram(
  "http_request_duration_seconds",
  {
    description: "Duration of HTTP requests in seconds",
    unit: "s",
  },
);
