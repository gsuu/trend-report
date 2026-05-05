import fs from "node:fs/promises";
import path from "node:path";

const MAGAZINE_JSON_PATH = path.join(process.cwd(), "public", "data", "magazine.json");

export default async function handler(request, response) {
  if (request.method && request.method !== "GET") {
    response.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const raw = await fs.readFile(MAGAZINE_JSON_PATH, "utf8");
    const payload = JSON.parse(raw);
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    response.status(200).json({ ok: true, report: payload.report });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error.message || "Failed to read magazine data.",
    });
  }
}
