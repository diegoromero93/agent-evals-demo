import "dotenv/config";
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
for (const [index, step] of result.steps.entries()) {
  const toolCalls = step.toolCalls.map((call) => call.toolName).join(", ") || "none";
  console.log(`${index + 1}. tool calls: ${toolCalls}`);
}
