import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { tool } from "ai";
import { z } from "zod";
import mockData from "./data/mock-patients.json" with { type: "json" };
import type { MockPatientData } from "./types.js";

const data = mockData as MockPatientData;

export function getPatient(patientId: string) {
  return data.patients.find((patient) => patient.id === patientId) ?? null;
}

export function getUpcomingAppointment(patientId: string) {
  return data.appointments.find((appointment) => appointment.patientId === patientId) ?? null;
}

export const emailAgentTools = {
  getPatientById: tool({
    description: "Get mock patient demographics, doctor, condition, and medication instructions by patient ID.",
    inputSchema: z.object({
      patientId: z.string().describe("The mock patient ID, for example p_001."),
    }),
    execute: async ({ patientId }) => {
      const patient = getPatient(patientId);
      if (!patient) {
        return { found: false, patientId };
      }

      return { found: true, patient };
    },
  }),

  getUpcomingAppointment: tool({
    description: "Get the next scheduled mock appointment for a patient.",
    inputSchema: z.object({
      patientId: z.string().describe("The mock patient ID, for example p_001."),
    }),
    execute: async ({ patientId }) => {
      const appointment = getUpcomingAppointment(patientId);
      if (!appointment) {
        return { found: false, patientId };
      }

      return { found: true, appointment };
    },
  }),

  saveEmailTxt: tool({
    description: "Save the completed email body to a local .txt file.",
    inputSchema: z.object({
      filePath: z.string().describe("Relative path for the generated .txt email."),
      content: z.string().describe("The complete email text, including To and Subject lines."),
    }),
    execute: async ({ filePath, content }) => {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content, "utf8");
      return { saved: true, filePath, bytes: Buffer.byteLength(content, "utf8") };
    },
  }),
};
