import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(currentDir, "..", "..");
const appRoot = path.resolve(serverRoot, "..");

[
  path.join(serverRoot, ".env.local"),
  path.join(serverRoot, ".env"),
  path.join(appRoot, ".env.local"),
  path.join(appRoot, ".env"),
].forEach((envPath) => {
  dotenv.config({ path: envPath, override: false });
});
