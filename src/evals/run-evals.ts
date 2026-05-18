import "dotenv/config";
import { getEmailCase } from "../datasets/email-cases.js";
import { runDeterministicChecks } from "./deterministic.js";
import { runLlmJudge } from "./llm-judge.js";
import { runToolUsageChecks } from "./tool-usage.js";

const selectedCase = getEmailCase(process.argv[2]);

console.log(`Running evals for ${selectedCase.id}: ${selectedCase.outputFile}...`);

const deterministic = await runDeterministicChecks(selectedCase);
const toolUsage = await runToolUsageChecks(selectedCase);

console.log("\nDeterministic checks:");
for (const check of deterministic.checks) {
  const status = check.passed ? "PASS" : "FAIL";
  const details = check.details ? ` (${check.details})` : "";
  console.log(`${status} ${check.key}${details}`);
}

console.log("\nTool usage checks:");
for (const check of toolUsage) {
  const status = check.passed ? "PASS" : "FAIL";
  const details = check.details ? ` (${check.details})` : "";
  console.log(`${status} ${check.key}${details}`);
}

const deterministicPassed = deterministic.checks.every((check) => check.passed);
const toolUsagePassed = toolUsage.every((check) => check.passed);

if (!deterministic.emailText) {
  process.exitCode = 1;
} else {
  const judge = await runLlmJudge(selectedCase, deterministic.emailText);

  console.log("\nLLM judge:");
  console.log(JSON.stringify(judge, null, 2));

  process.exitCode = deterministicPassed && toolUsagePassed && judge.passed ? 0 : 1;
}
