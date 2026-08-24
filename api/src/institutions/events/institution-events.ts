export const INSTITUTION_EVENTS = {
  CREATED: "institution.created",
  UPDATED: "institution.updated",
  CAMPAIGN_UPDATED: "institution.campaign_settings.updated",
  ATTENDANCE_UPDATED: "institution.attendance_settings.updated",
} as const;

export class InstitutionCreatedEvent {
  constructor(
    public readonly institutionId: string,
    public readonly rueCode: string,
    public readonly name: string,
    public readonly userId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class InstitutionUpdatedEvent {
  constructor(
    public readonly institutionId: string,
    public readonly changes: Record<string, any>,
    public readonly userId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class InstitutionCampaignSettingsUpdatedEvent {
  constructor(
    public readonly institutionId: string,
    public readonly settings: {
      enableDigitalRudeUpdates?: boolean;
      maxRudeUpdatesPerYear?: number;
      activeNotificationChannels?: string[];
    },
    public readonly userId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class InstitutionAttendanceSettingsUpdatedEvent {
  constructor(
    public readonly institutionId: string,
    public readonly settings: {
      enableQrAttendance?: boolean;
      enableBiometricAttendance?: boolean;
      lateToleranceMinutes?: number;
      absentToleranceMinutes?: number;
      notificationFrequency?: string;
    },
    public readonly userId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
