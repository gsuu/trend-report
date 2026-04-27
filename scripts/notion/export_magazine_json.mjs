import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchMagazineReport } from "../legacy/fetch_notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputPath = path.join(root, "public", "data", "magazine.json");

const report = await fetchMagazineReport();

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  report,
}, null, 2)}\n`, "utf8");

console.log(`Wrote ${report.issues.length} issues to ${path.relative(root, outputPath)}`);
