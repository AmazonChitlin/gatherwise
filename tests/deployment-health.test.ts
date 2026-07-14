import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const healthRoute = read("app", "api", "health", "route.ts");
const railwayConfig = read("railway.toml");
const startScript = read("scripts", "start-railway.sh");
const packageJson = read("package.json");

test("health route stays read-only and fails safely", () => {
  assert.match(healthRoute, /export async function GET/);
  assert.match(healthRoute, /prisma\.ruleRecord\.findFirst/);
  assert.match(healthRoute, /Cache-Control\": \"no-store\"/);
  assert.doesNotMatch(healthRoute, /create|update|deleteMany|upsert/);
});

test("Railway config uses the deployment startup script and health check", () => {
  assert.match(railwayConfig, /startCommand = "\.\/scripts\/start-railway\.sh"/);
  assert.match(railwayConfig, /healthcheckPath = "\/api\/health"/);
  assert.match(railwayConfig, /restartPolicyType = "ON_FAILURE"/);
});

test("Railway startup script initializes SQLite safely before starting Next.js", () => {
  assert.match(startScript, /RAILWAY_VOLUME_MOUNT_PATH/);
  assert.match(startScript, /RUST_LOG="\$\{RUST_LOG:-info\}" npx prisma migrate deploy/);
  assert.match(startScript, /npm run prisma:seed/);
  assert.match(startScript, /\.gatherwise-init\.lock/);
  assert.match(startScript, /npm start -- --port/);
});

test("production start binds Next.js to external interfaces", () => {
  assert.match(packageJson, /next start --hostname 0\.0\.0\.0/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
