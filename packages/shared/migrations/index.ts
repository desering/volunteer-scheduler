import * as migration_20250107_215304 from './20250107_215304';

export const migrations = [
  {
    up: migration_20250107_215304.up,
    down: migration_20250107_215304.down,
    name: '20250107_215304'
  },
];
