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

export const withTrace = <TArgs extends unknown[], TReturn>(
  name: string,
  fn: (span: Span) => (...args: TArgs) => TReturn | Promise<TReturn>,
  options?: WithTraceOptions,
): ((...args: TArgs) => Promise<TReturn>) => {
  const tracer =
    options?.tracer ??
    trace.getTracer(options?.tracerName ?? defaultTracerName);

  return (...args: TArgs): Promise<TReturn> => {
    return tracer.startActiveSpan(name, async (span): Promise<TReturn> => {
      if (options?.attributes) {
        span.setAttributes(options.attributes);
      }

      try {
        return await fn(span)(...args);
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
};
