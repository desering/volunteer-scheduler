import { buildConfig } from "payload";
import sharp from "sharp";
import { sharedConfig } from "../shared/shared-payload-config";

import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const baseConfig = sharedConfig({
  baseDir: path.resolve(dirname, "src"),
});

export default buildConfig({
  ...baseConfig,
  plugins: [],
  sharp,
  admin: {
    ...baseConfig.admin,
    components: {
      views: {
        prepareShifts: {
          Component: "/components/prepare-shifts#MyCustomView",
          path: "/prepare-shifts",
        },
      },
      beforeDashboard: ["@/components/link-to-prepare-shifts"],
    },
  },
});
