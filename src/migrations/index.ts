import * as migration_20250107_215304 from "./20250107_215304";
import * as migration_20250131_082459_add_phone_number from "./20250131_082459_add_phone_number";

export const migrations = [
  {
    up: migration_20250107_215304.up,
    down: migration_20250107_215304.down,
    name: "20250107_215304",
  },
  {
    up: migration_20250131_082459_add_phone_number.up,
    down: migration_20250131_082459_add_phone_number.down,
    name: "20250131_082459_add_phone_number",
  },
];
