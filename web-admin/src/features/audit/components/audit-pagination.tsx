import { SwissPagination } from '@/shared/ui'

interface AuditPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (newPage: number) => void
}

export default function AuditPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: AuditPaginationProps) {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="registros de auditoría"
      onPageChange={onPageChange}
    />
  )
}
