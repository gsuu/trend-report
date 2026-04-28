import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { outputDate } from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const runsDir = path.join(root, "runs");

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
    ? process.argv[index + 1]
    : fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function argDate() {
  return argValue("--date", outputDate());
}

function runDir(date) {
  return path.join(runsDir, date);
}

function runConfig(date) {
  return { TRACKING_OUTPUT_DATE: date };
}

function pythonCommand() {
  return process.platform === "win32" ? "python" : "python3";
}

function runCommand(command, args, env, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: false,
      env: { ...process.env, ...env },
    });

    child.on("exit", (code) => {
      if (code === 0) resolve({ label, code });
      else reject(new Error(`${label} 실패 (code=${code})`));
    });
    child.on("error", reject);
  });
}

function stepCommand(label, command, args, env = {}) {
  return { label, command, args, env };
}

function collectSendTo() {
  const toArgs = process.argv
    .filter((arg) => arg.startsWith("--send-to="))
    .map((arg) => arg.slice("--send-to=".length).split(",").map((email) => email.trim()))
    .flat()
    .filter(Boolean);
  return toArgs;
}

function buildSteps(date, options) {
  const steps = [];

  if (!options.skipFetch) {
    steps.push(stepCommand(
      "service 수집",
      process.execPath,
      ["scripts/tracking/fetch_service_news.mjs"],
      runConfig(date),
    ));
    steps.push(stepCommand(
      "design 수집",
      process.execPath,
      ["scripts/tracking/fetch_design_news.mjs"],
      runConfig(date),
    ));
    steps.push(stepCommand(
      "dev 수집",
      process.execPath,
      ["scripts/tracking/fetch_dev_news.mjs"],
      runConfig(date),
    ));
  }

  if (!options.skipPrepare) {
    steps.push(stepCommand(
      "기사 정리 및 분류",
      process.execPath,
      ["scripts/tracking/collect_materials.mjs", "--no-fetch"],
      runConfig(date),
    ));
  }

  if (options.qc) {
    const qualityArgs = ["scripts/tracking/workflow_quality_gate.mjs", `--date=${date}`];
    if (options.strictQc) qualityArgs.push("--strict");
    steps.push(stepCommand(
      "워크플로 QA",
      process.execPath,
      qualityArgs,
      {},
    ));
  }

  if (options.exportJson) {
    steps.push(stepCommand(
      "magazine.json 갱신",
      pythonCommand(),
      ["scripts/notion/export_magazine_json.py", path.join("runs", date, "magazine-report.md")],
      {},
    ));
  }

  if (options.sendStage) {
    if (!options.report) {
      throw new Error("뉴스레터 발송을 사용할 때는 --report를 지정해 주세요.");
    }

    const recipients = options.sendTo.length ? options.sendTo : [];
    if (!recipients.length && options.sendStage === "test") {
      recipients.push("jisuk@cttd.co.kr");
    }

    const sendArgs = [
      "scripts/newsletter/send_newsletter.py",
      options.report,
      "--stage",
      options.sendStage,
      "--audience",
      options.audience,
    ];
    if (options.sendStage !== "preview") {
      sendArgs.push("--send");
    }
    if (recipients.length) {
      sendArgs.push("--to", recipients.join(","));
    }
    if (options.approved) sendArgs.push("--approved");
    if (options.magazineBaseUrl) sendArgs.push("--magazine-base-url", options.magazineBaseUrl);

    steps.push(stepCommand(
      `${options.sendStage} 이메일 발송`,
      pythonCommand(),
      sendArgs,
      {},
    ));
  }

  return steps;
}

async function main() {
  const date = argDate();
  const options = {
    skipFetch: hasArg("--skip-fetch"),
    skipPrepare: hasArg("--skip-prepare"),
    qc: !hasArg("--skip-qc"),
    strictQc: hasArg("--strict-qc"),
    exportJson: hasArg("--export-json"),
    sendStage: argValue("--send-stage", ""),
    report: argValue("--report", path.join("runs", date, "magazine-report.md")),
    sendTo: collectSendTo(),
    approved: hasArg("--approved"),
    audience: argValue("--audience", "general"),
    magazineBaseUrl: argValue("--magazine-base-url", "https://magazine.cttd.co.kr"),
  };

  const steps = buildSteps(date, options);
  if (!steps.length) {
    console.log("실행할 단계가 없습니다.");
    return;
  }

  const statePath = path.join(runDir(date), "workflow-state.json");
  const summary = {
    date,
    command: process.argv.slice(2),
    steps: steps.map((step) => step.label),
    startedAt: new Date().toISOString(),
    results: [],
  };
  await fs.mkdir(runDir(date), { recursive: true });

  console.log(`[workflow] 시작 date=${date}`);
  console.log(steps.map((step, index) => `${index + 1}. ${step.label}`).join("\n"));

  for (const step of steps) {
    const startedAt = new Date().toISOString();
    console.log(`[start] ${step.label}`);
    const result = await runCommand(step.command, step.args, step.env, step.label);
    const finishedAt = new Date().toISOString();
    summary.results.push({
      label: step.label,
      command: `${step.command} ${step.args.join(" ")}`,
      startedAt,
      finishedAt,
    });
    console.log(`[done] ${step.label}`);
    await fs.writeFile(statePath, `${JSON.stringify(summary, null, 2)}\n`, "utf-8");
  }

  summary.finishedAt = new Date().toISOString();
  summary.status = "ok";
  await fs.writeFile(statePath, `${JSON.stringify(summary, null, 2)}\n`, "utf-8");

  console.log("workflow 완료");
  console.log(`요약 파일: ${path.relative(root, statePath).replaceAll("\\", "/")}`);
  if (options.sendStage) {
    console.log("다음 단계: send 결과가 기대값인지 콘솔 로그를 확인하세요.");
  }
}

main().catch((error) => {
  console.error(`workflow 실행 실패: ${error.message}`);
  process.exit(1);
});
