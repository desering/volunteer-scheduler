import {
  type Attributes,
  type Span,
  SpanStatusCode,
  type Tracer,
  trace,
} from "@opentelemetry/api";

type WithTraceOptions = {
  attributes?: Attributes;
  tracer?: Tracer;
  tracerName?: string;
};

const defaultTracerName = "volunteer-scheduler";

export const withTrace = async <T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: WithTraceOptions,
): Promise<T> => {
  const tracer =
    options?.tracer ??
    trace.getTracer(options?.tracerName ?? defaultTracerName);

  return await tracer.startActiveSpan(name, async (span) => {
    if (options?.attributes) {
      span.setAttributes(options.attributes);
    }

    try {
      return await fn(span);
    } catch (error) {
      span.recordException(
        error instanceof Error ? error : new Error(String(error)),
      );
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
};
