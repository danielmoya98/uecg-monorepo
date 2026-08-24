import { RefreshCcw } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const DataUpdatesHeader = () => {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'SECRETARÍA' },
        { label: 'SOLICITUDES DIGITALES', href: '/data-updates' },
        { label: 'ACTUALIZACIONES RUDE', icon: RefreshCcw },
      ]}
      title="Actualizaciones RUDE"
      description="Bandeja de entrada y auditoría de formularios digitales enviados por los apoderados."
    />
  );
};
export default DataUpdatesHeader;
