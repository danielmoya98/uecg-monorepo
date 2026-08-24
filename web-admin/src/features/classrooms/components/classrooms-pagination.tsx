import { SwissPagination } from '@/shared/ui'

interface ClassroomsPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export const ClassroomsPagination = ({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ClassroomsPaginationProps) => {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="aulas"
      onPageChange={onPageChange}
    />
  )
}
export default ClassroomsPagination
