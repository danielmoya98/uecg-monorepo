export interface Student {
  id: string;
  names: string;
  lastNamePaterno: string;
  lastNameMaterno?: string;
  ci: string;
  birthDate?: string;
  rudeCode?: string;
}

export interface RudeRecord {
  id: string;
  zone?: string;
  street?: string;
  houseNumber?: string;
  cellphone?: string;
}

export interface Enrollment {
  id: string;
  student: Student;
  classroom?: {
    id: string;
    grade: string;
    section: string;
    level: string;
  };
}

export interface ProposedData {
  names: string;
  lastNamePaterno: string;
  ci: string;
  birthDate: string;
  zone: string;
  street: string;
  houseNumber: string;
  cellphone: string;
}

export interface DataUpdateRequest {
  id: string;
  createdAt: string;
  enrollmentId: string;
  proposedData: ProposedData;
  enrollment?: Enrollment;
}

export interface BroadcastProjection {
  push: number;
  email: number;
  whatsapp: number;
  unreachable: number;
}

export interface BroadcastPreviewData {
  total: number;
  projection: BroadcastProjection;
}

export interface WhatsappTask {
  studentName: string;
  whatsappLink: string;
}

export interface BroadcastResponse {
  message: string;
  stats?: {
    pendingWhatsApp?: WhatsappTask[];
  };
}

export interface Option {
  value: string;
  label: string;
}

export interface Classroom {
  id: string;
  grade: string;
  section: string;
  level: string;
}
