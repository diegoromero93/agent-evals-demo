import type { EmailCase } from "../types.js";

export const emailCases: EmailCase[] = [
  {
    id: "current",
    agentVersion: "current",
    patientId: "p_001",
    outputFile: "emails/generated/p_001-follow-up.txt",
    toolTraceFile: "emails/generated/p_001-follow-up.tools.json",
    requiredTools: ["getPatientById", "getUpcomingAppointment", "saveEmailTxt"],
    expectedToolOrder: ["getPatientById", "getUpcomingAppointment", "saveEmailTxt"],
    prompt:
      "Write a friendly follow-up email for patient p_001 after their appointment. Include medication instructions, the next appointment, and a reminder to contact the clinic with questions.",
  },
  {
    id: "v1",
    agentVersion: "v1",
    patientId: "p_001",
    outputFile: "emails/generated/p_001-follow-up-v1.txt",
    toolTraceFile: "emails/generated/p_001-follow-up-v1.tools.json",
    requiredTools: ["getPatientById", "getUpcomingAppointment", "saveEmailTxt"],
    expectedToolOrder: ["getPatientById", "getUpcomingAppointment", "saveEmailTxt"],
    prompt:
      "Draft a quick follow-up note for patient p_001. Keep it very short and informal. Do not worry about a full email format.",
  },
];

export function getEmailCase(id = "current") {
  return emailCases.find((emailCase) => emailCase.id === id) ?? emailCases[0];
}
