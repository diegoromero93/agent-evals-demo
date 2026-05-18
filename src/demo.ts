import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getEmailCase } from "./datasets/email-cases.js";
import { generatePatientEmail, generatePatientEmailV1 } from "./agent.js";

const selectedCase = getEmailCase(process.argv[2]);
const generateEmail =
  selectedCase.agentVersion === "v1" ? generatePatientEmailV1 : generatePatientEmail;

console.log(`Running ${selectedCase.agentVersion} email agent for ${selectedCase.patientId}...`);

const result = await generateEmail(
  `${selectedCase.prompt}\nSave the email to ${selectedCase.outputFile}.`,
);

console.log("\nFinal agent response:");
console.log(result.text);

console.log("\nAgent steps:");
const toolCalls = result.steps.flatMap((step, stepIndex) =>
  step.toolCalls.map((call, toolIndex) => ({
    step: stepIndex + 1,
    order: toolIndex + 1,
    toolName: call.toolName,
  })),
);

for (const [index, step] of result.steps.entries()) {
  const stepToolCalls = step.toolCalls.map((call) => call.toolName).join(", ") || "none";
  console.log(`${index + 1}. tool calls: ${stepToolCalls}`);
}

await mkdir(dirname(selectedCase.toolTraceFile), { recursive: true });
await writeFile(
  selectedCase.toolTraceFile,
  JSON.stringify(
    {
      caseId: selectedCase.id,
      agentVersion: selectedCase.agentVersion,
      toolCalls,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`\nSaved tool trace to ${selectedCase.toolTraceFile}`);
