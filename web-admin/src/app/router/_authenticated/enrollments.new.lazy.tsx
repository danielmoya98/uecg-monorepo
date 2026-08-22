import { createLazyFileRoute } from '@tanstack/react-router'

// Componentes UI de la Feature
import { NewEnrollmentHeader } from '@/features/enrollments/components/NewEnrollmentHeader'
import AdminEnrollmentForm from '@/features/enrollments/components/AdminEnrollmentForm'

export const Route = createLazyFileRoute('/_authenticated/enrollments/new')({
  component: NewEnrollmentPage,
})

function NewEnrollmentPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 min-h-[calc(100vh-140px)]">
      <NewEnrollmentHeader />
      <AdminEnrollmentForm />
    </div>
  )
}
