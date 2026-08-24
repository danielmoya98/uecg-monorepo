import { SwissPagination } from "@/shared/ui";

interface EnrollmentsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export default function EnrollmentsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: EnrollmentsPaginationProps) {
  return (
    <SwissPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemLabel="solicitudes"
      onPageChange={onPageChange}
    />
  );
}
