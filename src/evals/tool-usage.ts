import { readFile } from "node:fs/promises";
import type { EmailCase } from "../types.js";
import type { DeterministicCheck } from "./deterministic.js";

type ToolTrace = {
  toolCalls?: {
    step?: number;
    order?: number;
    toolName?: string;
  }[];
};

function firstToolIndex(toolCalls: { toolName?: string }[], toolName: string) {
  return toolCalls.findIndex((call) => call.toolName === toolName);
}

export async function runToolUsageChecks(emailCase: EmailCase): Promise<DeterministicCheck[]> {
  const checks: DeterministicCheck[] = [];
  let trace: ToolTrace;

  try {
    trace = JSON.parse(await readFile(emailCase.toolTraceFile, "utf8")) as ToolTrace;
    checks.push({ key: "tool_trace_file_exists", passed: true });
  } catch (error) {
    checks.push({ key: "tool_trace_file_exists", passed: false, details: String(error) });
    return checks;
  }

  const toolCalls = Array.isArray(trace.toolCalls) ? trace.toolCalls : [];
  const calledTools = toolCalls.map((call) => call.toolName).filter(Boolean).join(", ") || "none";

  for (const toolName of emailCase.requiredTools) {
    checks.push({
      key: `required_tool_${toolName}_called`,
      passed: firstToolIndex(toolCalls, toolName) !== -1,
      details: `called tools: ${calledTools}`,
    });
  }

  for (let index = 0; index < emailCase.expectedToolOrder.length - 1; index += 1) {
    const earlierTool = emailCase.expectedToolOrder[index];
    const laterTool = emailCase.expectedToolOrder[index + 1];
    const earlierIndex = firstToolIndex(toolCalls, earlierTool);
    const laterIndex = firstToolIndex(toolCalls, laterTool);

    checks.push({
      key: `${earlierTool}_before_${laterTool}`,
      passed: earlierIndex !== -1 && laterIndex !== -1 && earlierIndex < laterIndex,
      details: `called tools: ${calledTools}`,
    });
  }

  return checks;
}
