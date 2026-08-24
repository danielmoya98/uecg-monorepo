import type { DrawerMode } from '../hooks/use-subjects-data'
import type { Subject } from '../types/subjects.types'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import SubjectActionConfirm from './subject-action-confirm'
import SubjectForm from './subject-form'

interface SubjectDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: DrawerMode
  subjectData?: Subject | null
  allowedLevels: string[]
  createMutation: any
  updateMutation: any
  deleteMutation: any
}

export default function SubjectDrawer({
  isOpen,
  onClose,
  mode,
  subjectData,
  allowedLevels,
  createMutation,
  updateMutation,
  deleteMutation,
}: SubjectDrawerProps) {
  const handleFormSubmit = (formData: any) => {
    if (mode === 'create') {
      createMutation.mutate(formData)
    } else if (mode === 'edit' && subjectData?.id) {
      updateMutation.mutate({ id: subjectData.id, data: formData })
    }
  }

  const handleDeleteConfirm = () => {
    if (subjectData?.id) {
      deleteMutation.mutate(subjectData.id)
    }
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const titles = {
    create: 'Nueva Materia',
    edit: 'Editar Materia',
    delete: 'Eliminar Materia',
  }

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={titles[mode]}
      kicker="Catálogo General"
      icon={mode === 'delete' ? '!' : subjectData?.name?.charAt(0).toUpperCase() || '+'}
      headerVariant={mode === 'delete' ? 'danger' : 'default'}
      isSubmitting={isSubmitting}
      maxWidth="max-w-[420px]"
    >
      {/* Contenedor del Formulario / Contenido */}
      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar" tabIndex={0}>
        {mode === 'delete' ? (
          <SubjectActionConfirm
            subjectName={subjectData?.name}
            subjectLevel={subjectData?.level}
            onCancel={onClose}
            onConfirm={handleDeleteConfirm}
            isSubmitting={isSubmitting}
          />
        ) : (
          <SubjectForm
            mode={mode}
            isOpen={isOpen}
            initialData={subjectData}
            allowedLevels={allowedLevels}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </DrawerShell>
  )
}

