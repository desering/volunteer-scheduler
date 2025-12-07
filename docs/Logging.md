# Logging

This project uses [Pino](https://getpino.io/) for structured logging.

## Usage

Import the logger and use it throughout your application:

```typescript
import { logger } from '@/lib/logger';

// Basic logging
logger.info('Application started');
logger.error('Something went wrong');
logger.debug('Debug information');
logger.warn('Warning message');

// Structured logging with context
logger.info({ userId: 123, action: 'login' }, 'User logged in');
logger.error({ err, requestId }, 'Request failed');

// Child loggers for specific contexts
const userLogger = logger.child({ userId: 123 });
userLogger.info('User action performed');
```

## Configuration

### Log Levels

Control log verbosity with the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug bun dev    # Show all logs including debug
LOG_LEVEL=info bun dev     # Default - info and above
LOG_LEVEL=warn bun dev     # Only warnings and errors
LOG_LEVEL=error bun dev    # Only errors
```

Available levels (in order of priority):
- `trace` - Very detailed debugging
- `debug` - Debug information
- `info` - General informational messages (default)
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors

### Development vs Production

**Development mode** (`NODE_ENV !== 'production'`):
- Uses `pino-pretty` for human-readable formatted output
- Colorized output
- Timestamp formatting

**Production mode** (`NODE_ENV === 'production'`):
- Outputs structured JSON logs
- Optimized for log aggregation systems
- Better performance

## Best Practices

1. **Use structured logging** - Pass objects as the first argument:
   ```typescript
   // Good
   logger.info({ userId, eventId }, 'User signed up for event');

   // Avoid
   logger.info(`User ${userId} signed up for event ${eventId}`);
   ```

2. **Use appropriate log levels**:
   - `debug`: Detailed information for debugging
   - `info`: Normal application flow
   - `warn`: Potentially harmful situations
   - `error`: Error events that might still allow the app to continue
   - `fatal`: Severe errors that cause premature termination

3. **Avoid logging sensitive information**:
   ```typescript
   // Bad - exposes passwords
   logger.info({ user }, 'User logged in');

   // Good - only log necessary info
   logger.info({ userId: user.id, email: user.email }, 'User logged in');
   ```

4. **Use child loggers for context**:
   ```typescript
   const requestLogger = logger.child({ requestId, userId });
   requestLogger.info('Processing request');
   requestLogger.debug('Step 1 complete');
   requestLogger.info('Request complete');
   ```

## Examples

### Server-side logging

```typescript
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  logger.info('API request received');

  try {
    const data = await fetchData();
    logger.debug({ dataCount: data.length }, 'Data fetched successfully');
    return Response.json(data);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch data');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Server actions

```typescript
'use server';

import { logger } from '@/lib/logger';

export async function createEvent(data: EventData) {
  logger.info({ eventName: data.name }, 'Creating event');

  try {
    const event = await db.events.create(data);
    logger.info({ eventId: event.id }, 'Event created successfully');
    return { success: true, event };
  } catch (err) {
    logger.error({ err, eventName: data.name }, 'Failed to create event');
    return { success: false, error: 'Failed to create event' };
  }
}
```
