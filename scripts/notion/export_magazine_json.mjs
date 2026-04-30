import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchMagazineReport } from "./fetch_notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputPath = path.join(root, "public", "data", "magazine.json");

const report = await fetchMagazineReport();
await applyLocalReportOrder(report);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  report,
}, null, 2)}\n`, "utf8");

console.log(`Wrote ${report.issues.length} issues to ${path.relative(root, outputPath)}`);

async function applyLocalReportOrder(report) {
  const reportPath = await latestRunReportPath();
  if (!reportPath) return;

  const markdown = await fs.readFile(reportPath, "utf8");
  const order = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^####\s+\d+\.\s+\[[^\]]+\]\s*(.+)$/);
    if (!match) continue;
    const title = normalizeTitle(match[1]);
    if (title && !order.has(title)) order.set(title, order.size);
  }
  if (!order.size) return;

  report.issues.sort((a, b) => {
    const aOrder = order.get(normalizeTitle(a.takeawayHtml));
    const bOrder = order.get(normalizeTitle(b.takeawayHtml));
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    return 0;
  });

  report.issues = report.issues.map((issue, index) => {
    const number = String(index + 1).padStart(2, "0");
    return { ...issue, number, route: `/articles/${number}` };
  });
}

async function latestRunReportPath() {
  const runsPath = path.join(root, "runs");
  const entries = await fs.readdir(runsPath, { withFileTypes: true }).catch(() => []);
  const reports = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(runsPath, entry.name, "magazine-report.md"))
    .sort();

  for (const reportPath of reports.reverse()) {
    try {
      await fs.access(reportPath);
      return reportPath;
    } catch {
      // Try the next run directory.
    }
  }
  return "";
}

function normalizeTitle(value = "") {
  return String(value)
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/\s+/g, " ")
    .trim();
}
