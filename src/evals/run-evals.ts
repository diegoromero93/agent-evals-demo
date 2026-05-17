import "dotenv/config";
import { getEmailCase } from "../datasets/email-cases.js";
import { runDeterministicChecks } from "./deterministic.js";
import { runLlmJudge } from "./llm-judge.js";

const selectedCase = getEmailCase(process.argv[2]);

console.log(`Running evals for ${selectedCase.id}: ${selectedCase.outputFile}...`);

const deterministic = await runDeterministicChecks(selectedCase);

console.log("\nDeterministic checks:");
for (const check of deterministic.checks) {
  const status = check.passed ? "PASS" : "FAIL";
  const details = check.details ? ` (${check.details})` : "";
  console.log(`${status} ${check.key}${details}`);
}

if (!deterministic.emailText) {
  process.exitCode = 1;
} else {
  const judge = await runLlmJudge(selectedCase, deterministic.emailText);

  console.log("\nLLM judge:");
  console.log(JSON.stringify(judge, null, 2));

  const deterministicPassed = deterministic.checks.every((check) => check.passed);
  process.exitCode = deterministicPassed && judge.passed ? 0 : 1;
}
