import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getPatient, getUpcomingAppointment } from "../tools.js";
import type { EmailCase } from "../types.js";

const JudgeResultSchema = z.object({
  score: z.number().min(1).max(5),
  passed: z.boolean(),
  reasoning: z.string(),
  risks: z.array(z.string()),
  improvements: z.array(z.string()),
});

export type JudgeResult = z.infer<typeof JudgeResultSchema>;

export async function runLlmJudge(emailCase: EmailCase, emailText: string): Promise<JudgeResult> {
  const patient = getPatient(emailCase.patientId);
  const appointment = getUpcomingAppointment(emailCase.patientId);
  const modelName = process.env.OPENAI_JUDGE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const result = await generateText({
    model: openai(modelName),
    output: Output.object({ schema: JudgeResultSchema }),
    prompt: [
      "You are evaluating a mock patient follow-up email. Return only the structured evaluation.",
      "Score from 1 to 5. Passing requires score >= 4.",
      "Criteria:",
      "- Clear, patient-friendly tone.",
      "- Uses only the provided patient and appointment data.",
      "- Repeats medication instructions without changing them.",
      "- Includes appointment reminder.",
      "- Avoids new medical advice or diagnosis claims.",
      "- Tells the patient to contact the clinic with questions.",
      "",
      `Patient data: ${JSON.stringify(patient)}`,
      `Appointment data: ${JSON.stringify(appointment)}`,
      "",
      `Email:\n${emailText}`,
    ].join("\n"),
  });

  return result.output;
}
