import fs from "node:fs";
import path from "node:path";

const exceptions: string[] = ["20260125_145020", "20250107_215304"];

const migrationsWithoutName = fs
  // get all migrations
  .globSync("./src/migrations/*.ts")
  // remove path and file extension
  .map((file: string) => path.basename(file, ".ts"))
  // filter out migrations index
  .filter((fileName: string) => fileName !== "index")
  // filter out exceptions
  .filter((fileName: string) => !exceptions.includes(fileName))
  // filter out migrations that have names
  .filter((fileName: string) => fileName.length < 16);

if (migrationsWithoutName.length === 0) {
  process.exit(0);
}

console.log(migrationsWithoutName);
process.exit(1);
