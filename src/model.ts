import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

type Provider = "openai" | "anthropic";

function getProvider(): Provider {
  const provider = process.env.AI_PROVIDER ?? "openai";

  if (provider === "openai" || provider === "anthropic") {
    return provider;
  }

  throw new Error(`Unsupported AI_PROVIDER "${provider}". Use "openai" or "anthropic".`);
}

export function getLanguageModel({ judge = false } = {}) {
  const provider = getProvider();

  if (provider === "anthropic") {
    const modelName = judge
      ? process.env.ANTHROPIC_JUDGE_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest"
      : process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";

    return anthropic(modelName);
  }

  const modelName = judge
    ? process.env.OPENAI_JUDGE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
    : process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  return openai(modelName);
}
