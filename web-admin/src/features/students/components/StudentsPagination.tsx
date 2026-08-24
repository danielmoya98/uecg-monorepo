import { SwissPagination } from "@/shared/ui";

interface StudentsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export default function StudentsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: StudentsPaginationProps) {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="estudiantes"
      onPageChange={onPageChange}
    />
  );
}
