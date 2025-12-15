import type { Meter } from "@opentelemetry/api";
import { metrics } from "@opentelemetry/api";

export const meter: Meter = metrics.getMeter("volunteer-scheduler");
