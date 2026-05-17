import { readFile } from "node:fs/promises";
import { getPatient, getUpcomingAppointment } from "../tools.js";
import type { EmailCase } from "../types.js";

export type DeterministicCheck = {
  key: string;
  passed: boolean;
  details?: string;
};

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function includesAny(text: string, values: string[]) {
  const normalized = text.toLowerCase();
  return values.some((value) => normalized.includes(value.toLowerCase()));
}

export async function runDeterministicChecks(emailCase: EmailCase): Promise<{
  emailText: string;
  checks: DeterministicCheck[];
}> {
  let emailText = "";
  const checks: DeterministicCheck[] = [];

  try {
    emailText = await readFile(emailCase.outputFile, "utf8");
    checks.push({ key: "email_file_exists", passed: true });
  } catch (error) {
    checks.push({ key: "email_file_exists", passed: false, details: String(error) });
    return { emailText, checks };
  }

  const patient = getPatient(emailCase.patientId);
  const appointment = getUpcomingAppointment(emailCase.patientId);
  const medication = patient?.medications[0];
  const words = wordCount(emailText);

  checks.push(
    { key: "subject_present", passed: /^Subject:/im.test(emailText) },
    { key: "patient_name_present", passed: patient ? emailText.includes(patient.name) : false },
    { key: "doctor_name_present", passed: patient ? emailText.includes(patient.doctor) : false },
    { key: "appointment_date_present", passed: appointment ? emailText.includes(appointment.date) : false },
    { key: "appointment_time_present", passed: appointment ? emailText.includes(appointment.time) : false },
    { key: "medication_name_present", passed: medication ? emailText.includes(medication.name) : false },
    {
      key: "medication_instruction_present",
      passed: medication ? emailText.includes(medication.instructions) : false,
    },
    {
      key: "contains_clinic_contact_disclaimer",
      passed: includesAny(emailText, ["contact the clinic", "call the clinic", "reach out to the clinic"]),
    },
    {
      key: "no_emergency_advice",
      passed: !includesAny(emailText, ["ignore", "do not seek emergency", "skip emergency"]),
    },
    {
      key: "word_count_in_range",
      passed: words >= 80 && words <= 250,
      details: `${words} words`,
    },
  );

  return { emailText, checks };
}
