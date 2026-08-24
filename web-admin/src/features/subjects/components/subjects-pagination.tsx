import { SwissPagination } from '@/shared/ui'

interface SubjectsPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (newPage: number) => void
}

export default function SubjectsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: SubjectsPaginationProps) {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="materias"
      onPageChange={onPageChange}
    />
  )
}
