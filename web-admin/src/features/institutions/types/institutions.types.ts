export type InstitutionDepartment =
  | 'CHUQUISACA'
  | 'LA_PAZ'
  | 'COCHABAMBA'
  | 'SANTA_CRUZ'
  | 'POTOSI'
  | 'ORURO'
  | 'TARIJA'
  | 'BENI'
  | 'PANDO';

export interface InstitutionPayload {
  rueCode: string;
  name: string;
  dependencyType: 'FISCAL' | 'PRIVADA' | 'CONVENIO';
  department: InstitutionDepartment;
  municipality: string;
  district: string;
  address: string;
  phone?: string;
  email?: string;
  foundedYear?: number | null;
  shifts: string[];
  levels: string[];
  schedulingMode: 'FIXED_BASE' | 'DYNAMIC';
}

export interface Institution extends InstitutionPayload {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignSettingsPayload {
  enableDigitalRudeUpdates: boolean;
  maxRudeUpdatesPerYear: number;
  activeNotificationChannels: string[];
}

export interface AttendanceSettingsPayload {
  enableQrAttendance: boolean;
  enableBiometricAttendance: boolean;
  lateToleranceMinutes: number;
  absentToleranceMinutes: number;
  notificationFrequency: string;
}
