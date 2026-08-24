import { SwissPagination } from '@/shared/ui'

interface UsersPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (newPage: number) => void
}

export default function UsersPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: UsersPaginationProps) {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="usuarios"
      onPageChange={onPageChange}
    />
  )
}
