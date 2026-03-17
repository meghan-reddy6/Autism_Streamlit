import { create } from "zustand";

export type Score = 1 | 2 | 3 | 4;

export interface QuestionResponse {
  question_id: string;
  section: string;
  score: Score;
}

export interface PatientDetails {
  child_name: string;
  child_age: string;
  child_gender: string;
  parent_name: string;
  contact_number: string;
  contact_email: string;
  consent_given: boolean;
}

interface AssessmentState {
  patientDetails: PatientDetails | null;
  setPatientDetails: (details: PatientDetails) => void;
  responses: Record<string, QuestionResponse>;
  setResponse: (question_id: string, section: string, score: Score) => void;
  clearResponses: () => void;
  clearAssessment: () => void;
  getAnsweredCount: () => number;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  patientDetails: null,
  setPatientDetails: (details) => set({ patientDetails: details }),
  responses: {},
  setResponse: (question_id, section, score) =>
    set((state) => ({
      responses: {
        ...state.responses,
        [question_id]: { question_id, section, score },
      },
    })),
  clearResponses: () => set({ responses: {} }),
  clearAssessment: () => set({ responses: {}, patientDetails: null }),
  getAnsweredCount: () => Object.keys(get().responses).length,
}));
