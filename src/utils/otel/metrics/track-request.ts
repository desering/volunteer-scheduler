import { requestCounter, requestDuration } from "./initializer";

interface TrackRequest {
  route: string; // normalized path e.g. /api/events/[id]
  method: string; // GET, POST, etc.
  statusCode: number; // response status
  durationSeconds?: number; // measured request duration
}

/**
 * Tracks an HTTP request.
 * @param params.route Normalized route like /api/events/[id]
 * @param params.method HTTP method (GET, POST, etc.)
 * @param params.statusCode Response status
 * @param params.durationSeconds Optional request duration in seconds
 */
export function trackRequest({
  route,
  method,
  statusCode,
  durationSeconds,
}: TrackRequest): void {
  const attributes = {
    route,
    method,
    status_code: String(statusCode),
  };

  // Increment request count
  requestCounter.add(1, attributes);

  // Record duration if provided
  if (durationSeconds !== undefined) {
    requestDuration.record(durationSeconds, attributes);
  }
}
