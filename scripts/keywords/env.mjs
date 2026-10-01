// .env.local → .env 순서로 읽어 process.env에 없는 키만 채운다. 외부 dotenv 의존 없음.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let loaded = false;

export function loadDotenv() {
  if (loaded) return;
  loaded = true;
  for (const envName of [".env.local", ".env"]) {
    const envPath = path.join(repoRoot, envName);
    if (!existsSync(envPath)) continue;
    for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const [key, ...valueParts] = line.split("=");
      const cleanKey = key.trim();
      if (!cleanKey || process.env[cleanKey]) continue;
      process.env[cleanKey] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

export function argValue(name, fallback) {
  const prefix = `${name}=`;
  const hit = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

export function hasFlag(name) {
  return process.argv.slice(2).includes(name);
}
