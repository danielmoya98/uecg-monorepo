export interface PendingEnrollment {
  id: string;
  names: string;
  lastNamePaterno: string;
  lastNameMaterno?: string;
  ci: string;
  enrollmentType: "NUEVO" | "ANTIGUO" | "TRASPASO" | "EXTRANJERO";
  createdAt: string;
  rudeCode?: string;
}

export interface EnrollmentMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EnrollmentsQueryResponse {
  data: PendingEnrollment[];
  meta: EnrollmentMeta;
}

export interface Sibling {
  names: string;
  classroom: string;
}

export interface GuardianPivot {
  relationship: string;
  guardian: {
    ci: string;
    names: string;
    lastNamePaterno: string;
    lastNameMaterno?: string;
    phone: string;
  };
}

export interface EnrollmentDetails {
  id: string;
  rudeCode?: string;
  enrollmentType: string;
  createdAt: string;
  student?: {
    ci?: string;
    names: string;
    lastNamePaterno: string;
    lastNameMaterno?: string;
    guardians?: GuardianPivot[] | any[]; // Pivot or flattened depending on status
  };
  siblings?: Sibling[];
}
