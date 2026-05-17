# Agent Evals Demo

This is a small TypeScript demo for evaluating AI agents.

The demo uses AI SDK with the OpenAI adapter to run a patient follow-up email agent. The agent uses a tool loop to fetch mock patient data, fetch appointment data, and save the final email to a `.txt` file.

All data is fake mock data. Do not use real PHI in this demo.

## What This Demonstrates

- A tool-loop agent that retrieves mock patient and appointment data.
- A file-writing tool that saves generated emails as `.txt` files.
- Deterministic evals for exact requirements.
- An LLM-as-judge eval for tone, clarity, groundedness, and safety.
- An intentionally weaker `v1` prompt so eval failures are easy to show.

## Setup

```bash
npm install
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env`.

Optional model overrides:

```bash
OPENAI_MODEL=gpt-4.1-mini
OPENAI_JUDGE_MODEL=gpt-4.1-mini
```

## Happy Path Demo

Generate the better current email:

```bash
npm run demo
```

This creates:

```txt
emails/generated/p_001-follow-up.txt
```

Evaluate it:

```bash
npm run eval
```

## Intentionally Worse V1 Demo

Use this when you want the evals to show more failures.

Generate the weaker email:

```bash
npm run demo:v1
```

Evaluate it:

```bash
npm run eval:v1
```

This creates and evaluates:

```txt
emails/generated/p_001-follow-up-v1.txt
```

## Eval Types

The eval runner performs two kinds of checks:

1. Deterministic checks for file existence, required facts, required sections, medication instructions, disclaimer, and word count.
2. LLM-as-judge evaluation for tone, clarity, groundedness, safety, and completeness.

## Main Files

```txt
src/agent.ts                  ToolLoopAgent definitions for current and v1
src/tools.ts                  Agent tools for mock data lookup and file writing
src/data/mock-patients.json   Fake patient and appointment data
src/datasets/email-cases.ts   Current and v1 demo cases
src/evals/deterministic.ts    Rule-based eval checks
src/evals/llm-judge.ts        LLM-as-judge eval
src/evals/run-evals.ts        Eval runner
```

## Useful Commands

```bash
npm run check
npm run demo
npm run eval
npm run demo:v1
npm run eval:v1
```
