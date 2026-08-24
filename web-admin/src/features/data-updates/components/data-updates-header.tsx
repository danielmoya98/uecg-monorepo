import { RefreshCcw } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const DataUpdatesHeader = () => {
  return (
    <PageHeader
      kicker="CENTRO DE RESOLUCIONES"
      kickerIcon={RefreshCcw}
      title="Actualizaciones RUDE"
      description="Bandeja de entrada y auditoría de formularios digitales enviados por los apoderados."
    />
  );
};
export default DataUpdatesHeader;

