import * as migration_20250107_215304 from './20250107_215304';
import * as migration_20250131_082459_add_phone_number from './20250131_082459_add_phone_number';
import * as migration_20250402_113720_timezones_in_event_template from './20250402_113720_timezones_in_event_template';
import * as migration_20251027_155038_payload_version_migration from './20251027_155038_payload_version_migration';
import * as migration_20251116_184923_add_tags_collection from './20251116_184923_add_tags_collection';
import * as migration_20251220_014719_add_user_notification_preferences_collection from './20251220_014719_add_user_notification_preferences_collection';
import * as migration_20260105_132536_add_announcements_collection from './20260105_132536_add_announcements_collection';
import * as migration_20260112_112028_add_announcements_status from './20260112_112028_add_announcements_status';
import * as migration_20260120_173332_add_locations_collection from './20260120_173332_add_locations_collection';

export const migrations = [
  {
    up: migration_20250107_215304.up,
    down: migration_20250107_215304.down,
    name: '20250107_215304',
  },
  {
    up: migration_20250131_082459_add_phone_number.up,
    down: migration_20250131_082459_add_phone_number.down,
    name: '20250131_082459_add_phone_number',
  },
  {
    up: migration_20250402_113720_timezones_in_event_template.up,
    down: migration_20250402_113720_timezones_in_event_template.down,
    name: '20250402_113720_timezones_in_event_template',
  },
  {
    up: migration_20251027_155038_payload_version_migration.up,
    down: migration_20251027_155038_payload_version_migration.down,
    name: '20251027_155038_payload_version_migration',
  },
  {
    up: migration_20251116_184923_add_tags_collection.up,
    down: migration_20251116_184923_add_tags_collection.down,
    name: '20251116_184923_add_tags_collection',
  },
  {
    up: migration_20251220_014719_add_user_notification_preferences_collection.up,
    down: migration_20251220_014719_add_user_notification_preferences_collection.down,
    name: '20251220_014719_add_user_notification_preferences_collection',
  },
  {
    up: migration_20260105_132536_add_announcements_collection.up,
    down: migration_20260105_132536_add_announcements_collection.down,
    name: '20260105_132536_add_announcements_collection',
  },
  {
    up: migration_20260112_112028_add_announcements_status.up,
    down: migration_20260112_112028_add_announcements_status.down,
    name: '20260112_112028_add_announcements_status',
  },
  {
    up: migration_20260120_173332_add_locations_collection.up,
    down: migration_20260120_173332_add_locations_collection.down,
    name: '20260120_173332_add_locations_collection',
  },
];
