import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const TRACE_URL =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
  "http://localhost:4318/v1/traces";

const METRICS_URL =
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ??
  "http://localhost:4318/v1/metrics";

const traceExporter = new OTLPTraceExporter({ url: TRACE_URL });
const metricsExporter = new OTLPMetricExporter({
  url: METRICS_URL,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "volunteer-scheduler",
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricsExporter,
  }),
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();

process.on("SIGTERM", async () => {
  await sdk.shutdown();
});
