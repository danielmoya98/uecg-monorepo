import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { userSchema } from '../schemas/user.schema'
import type { UserFormValues } from '../schemas/user.schema'

import type { DrawerMode } from '../hooks/use-users-data'
import type { User } from '../types/users.types'

import UserActionConfirm from './user-action-confirm'
import UserForm from './user-form'

interface UserDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode: DrawerMode
  userData?: User | null
  // Mutaciones inyectadas desde useUsersData
  createMutation: any
  updateMutation: any
  deleteMutation: any
  reactivateMutation: any
  resetPasswordMutation: any
}

export default function UserDrawer({
  isOpen,
  onClose,
  onSuccess,
  mode,
  userData,
  createMutation,
  updateMutation,
  deleteMutation,
  reactivateMutation,
  resetPasswordMutation,
}: UserDrawerProps) {
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // 1. Formulario Reactivo con RHF + Zod
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      role: 'DOCENTE',
    },
  })

  // 2. Sincronización de Campos al Abrir
  useEffect(() => {
    if (isOpen) {
      if (userData && mode !== 'create') {
        const validRoles: Array<'SUPER_ADMIN' | 'DIRECTOR' | 'DOCENTE' | 'PADRE'> = [
          'SUPER_ADMIN',
          'DIRECTOR',
          'DOCENTE',
          'PADRE',
        ]
        const matchedRole =
          validRoles.find(
            (r) => r === userData.role || (r === 'SUPER_ADMIN' && userData.role === 'ADMIN'),
          ) || 'DOCENTE'

        reset({
          fullName: userData.fullName,
          role: matchedRole,
        })
        setGeneratedEmail(userData.email)
        setGeneratedPassword('')
      } else if (mode === 'create') {
        reset({
          fullName: '',
          role: 'DOCENTE',
        })
        setGeneratedEmail('')
        setGeneratedPassword('')
      }
    }
  }, [isOpen, userData, mode, reset])

  const fullNameValue = watch('fullName') || ''

  // 3. Autogenerar Correo y Clave Temporal
  useEffect(() => {
    if (mode === 'create' && fullNameValue.length > 2) {
      const parts = fullNameValue.toLowerCase().trim().split(' ')
      const emailBase =
        parts.length > 1 ? `${parts[0].charAt(0)}.${parts[parts.length - 1]}` : parts[0]
      setGeneratedEmail(`${emailBase}@uecg.edu.bo`.replace(/[^a-z0-9.@]/g, ''))
      if (!generatedPassword) {
        setGeneratedPassword(Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100))
      }
    } else if (mode === 'create') {
      setGeneratedEmail('')
      setGeneratedPassword('')
    }
  }, [fullNameValue, generatedPassword, mode])

  // Cierre mediante ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Compilar Credencial PDF
  const generatePDF = async (filename: string, pdfData: any) => {
    setIsGeneratingPDF(true)
    toast('Compilando Credencial PDF...', { icon: <FileText className="w-4 h-4" /> })

    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { CredentialTemplate } = await import('./credential-template')
      const blob = await pdf(<CredentialTemplate {...pdfData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast.error('Error al compilar el PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // 4. Submit Handlers
  const handleFormSubmit = (values: UserFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(
        {
          fullName: values.fullName,
          email: generatedEmail,
          passwordRaw: generatedPassword,
          role: values.role,
        },
        {
          onSuccess: async () => {
            toast.success('USUARIO CREADO EXITOSAMENTE')
            const requirePDF = `Credencial_${values.fullName.replace(/ /g, '_')}.pdf`
            await generatePDF(requirePDF, {
              mode,
              fullName: values.fullName,
              role: values.role,
              generatedEmail,
              generatedPassword,
            })
            if (onSuccess) onSuccess()
            onClose()
          },
        }
      )
    } else if (mode === 'edit' && userData?.id) {
      updateMutation.mutate(
        {
          id: userData.id,
          data: { fullName: values.fullName, role: values.role },
        },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
            onClose()
          },
        }
      )
    }
  }

  const handleConfirmAction = () => {
    if (!userData?.id) return

    if (mode === 'delete') {
      deleteMutation.mutate(userData.id, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
          onClose()
        },
      })
    } else if (mode === 'reactivate') {
      reactivateMutation.mutate(userData.id, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
          onClose()
        },
      })
    } else if (mode === 'reset') {
      resetPasswordMutation.mutate(userData.id, {
        onSuccess: async (result: any) => {
          toast.success('CREDENCIALES RESTAURADAS')
          const requirePDF = `Recuperacion_${result.fullName.replace(/ /g, '_')}.pdf`
          await generatePDF(requirePDF, {
            mode,
            fullName: result.fullName,
            role: userData.role,
            generatedEmail: userData.email,
            generatedPassword: result.newPassword,
          })
          if (onSuccess) onSuccess()
          onClose()
        },
      })
    }
  }

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reactivateMutation.isPending ||
    resetPasswordMutation.isPending

  const titles = {
    create: 'Nuevo Usuario',
    edit: 'Editar Perfil',
    delete: 'Desactivar Usuario',
    reset: 'Restaurar Clave',
    reactivate: 'Reactivar Usuario',
  }

  const headerVariant: 'default' | 'danger' | 'success' | 'warning' =
    mode === 'delete'
      ? 'danger'
      : mode === 'reactivate'
        ? 'success'
        : mode === 'reset'
          ? 'warning'
          : 'default'

  const iconDisplay =
    mode === 'delete'
      ? '!'
      : mode === 'reactivate'
        ? '✓'
        : mode === 'reset'
          ? '🔑'
          : mode === 'create'
            ? '+'
            : userData?.fullName?.charAt(0).toUpperCase() || 'U'

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={titles[mode]}
      kicker="Gestión de Accesos"
      icon={iconDisplay}
      headerVariant={headerVariant}
      isSubmitting={isSubmitting}
      maxWidth="max-w-[420px]"
    >
      {/* Contenedor scrollable */}
      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar" tabIndex={0}>
        {mode === 'delete' || mode === 'reactivate' || mode === 'reset' ? (
          <UserActionConfirm
            mode={mode}
            fullName={userData?.fullName || ''}
            onCancel={onClose}
            onConfirm={handleConfirmAction}
            isSubmitting={isSubmitting}
            isGeneratingPDF={isGeneratingPDF}
          />
        ) : (
          <UserForm
            mode={mode}
            register={register}
            errors={errors}
            fullNameValue={fullNameValue}
            generatedEmail={generatedEmail}
            generatedPassword={generatedPassword}
            onSubmit={handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
            isGeneratingPDF={isGeneratingPDF}
          />
        )}
      </div>
    </DrawerShell>
  )
}

