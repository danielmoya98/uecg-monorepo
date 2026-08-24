import { SwissSearchInput } from '@/shared/ui'

interface AuditToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onResetPage: () => void
}

export const AuditToolbar = ({
  searchTerm,
  onSearchChange,
  onResetPage,
}: AuditToolbarProps) => (
  <div className="w-full md:w-1/2">
    <SwissSearchInput
      value={searchTerm}
      onChange={(val) => {
        onSearchChange(val)
        onResetPage()
      }}
      placeholder="BUSCAR LOGS (Actor, Ruta, Método...) (CTRL+K)"
    />
  </div>
)
export default AuditToolbar
