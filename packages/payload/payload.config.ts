import { buildConfig } from "payload";
import sharp from "sharp";
import { sharedConfig } from "../shared/shared-payload-config";

import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const baseConfig = sharedConfig({
  baseDir: path.resolve(dirname, "src"),
  enableMigrations: true,
});

export default buildConfig({
  routes: {
    admin: "/",
  },
  ...baseConfig,
  plugins: [],
  sharp,
  admin: {
    ...baseConfig.admin,
    components: {
      beforeDashboard: ["@/components/dashboard-header#DashboardHeader"],

      views: {
        calender: {
          Component: "/components/views/calender-view#CalenderView",
          path: "/calender/:collectionSlug",
        },
      },
    },
  },
});
