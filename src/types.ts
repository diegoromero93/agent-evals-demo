export type Medication = {
  name: string;
  instructions: string;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  condition: string;
  medications: Medication[];
  doctor: string;
};

export type Appointment = {
  patientId: string;
  date: string;
  time: string;
  type: string;
};

export type MockPatientData = {
  patients: Patient[];
  appointments: Appointment[];
};

export type EmailCase = {
  id: "current" | "v1";
  agentVersion: "current" | "v1";
  patientId: string;
  outputFile: string;
  prompt: string;
};
