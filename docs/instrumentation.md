# Instrumentation

This document describes how logging, metrics, and tracing are implemented in the application.


## Logs

We use [Pino](https://getpino.io/) for structured logging.

For configuration details and usage guidelines, see [Logging](./Logging.md).


## Metrics

Metrics are collected using [OpenTelemetry Metrics](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/metrics.md#add-manual-instrumentation).

Custom metrics should be recorded via the `Meter` abstraction, exposed through the `OtelMetrics` utility. This utility wraps the OpenTelemetry `metrics.getMeter` API and provides a consistent interface for recording application metrics.

The metrics export destination can be configured via the `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` variable in the `.env` file.

### Recording metrics manually

```ts
import { OtelMetrics } from "@/utils/otel";

OtelMetrics.trackRequest({
  route: "/api/events/[id]",
  method: "GET",
  statusCode: 200,
  durationSeconds: 0.2,
});
```

This records:
* An HTTP request count
* The request duration


### HTTP API metrics wrapper

For most API routes, a shared HTTP wrapper is available that automatically records common metrics. The wrapper performs the following actions:

1. Increments the HTTP request counter
2. Records the request duration

This ensures consistent metric collection across all API endpoints.

```ts
import { ApiRequest } from "@/utils/http";

const apiRequest = ApiRequest.getInstance();

const handler = async (
  _req: NextRequest,
  ctx: RouteContext,
) => {
  // Replace `getRequest()` with the actual API implementation
  return Response.json(await getRequest());
};

// Replace `/api/route` with the actual API path
export const GET = apiRequest.run("/api/route", handler);
```


## Traces

HTTP requests are automatically instrumented and exported as traces using the default OpenTelemetry setup.

For custom trace instrumentation, refer to the
[OpenTelemetry Tracing documentation](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/tracing.md).

The metrics export destination can be configured via the `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` variable in the `.env` file.
