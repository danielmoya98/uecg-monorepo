import { ClassPeriodsSettingsPanel } from '@/features/class-periods';
import {
  useInstitutionData,
  useCampaignSettings,
  useAttendanceSettings,
  SettingsHeader,
  SettingsLoading,
  InstitutionForm,
  CampaignSettingsPanel,
  AttendanceSettingsPanel,
} from '@/features/institutions';

export default function SettingsPage() {
  const {
    currentInstitution,
    isLoading: isInstLoading,
    isSubmitting: isInstSubmitting,
    saveInstitution,
  } = useInstitutionData();

  const {
    settings: campaignSettings,
    isLoading: isCampLoading,
    isSubmitting: isCampSubmitting,
    saveSettings: saveCampaign,
  } = useCampaignSettings();

  const {
    settings: attendanceSettings,
    isLoading: isAttLoading,
    isSubmitting: isAttSubmitting,
    saveSettings: saveAttendance,
  } = useAttendanceSettings();

  if (isInstLoading || isCampLoading || isAttLoading) {
    return <SettingsLoading />;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
      <SettingsHeader />

      <InstitutionForm
        initialData={currentInstitution || null}
        isSubmitting={isInstSubmitting}
        onSubmit={saveInstitution}
      />

      {currentInstitution?.id && (
        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <CampaignSettingsPanel
            initialData={campaignSettings || null}
            isSubmitting={isCampSubmitting}
            onSubmit={saveCampaign}
          />
          <AttendanceSettingsPanel
            initialData={attendanceSettings || null}
            isSubmitting={isAttSubmitting}
            onSubmit={saveAttendance}
          />
          <ClassPeriodsSettingsPanel />
        </div>
      )}
    </div>
  );
}
