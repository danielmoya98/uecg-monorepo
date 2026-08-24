import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
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

  const headerClasses =
    mode === 'delete'
      ? 'bg-red-50 border-red-200 text-red-600'
      : mode === 'reactivate'
        ? 'bg-green-50 border-green-200 text-green-700'
        : mode === 'reset'
          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
          : 'bg-gray-50 border-uecg-line text-uecg-gray'

  // Renderizado inyectado mediante Portal en el body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Fondo interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
            onClick={!isSubmitting ? onClose : undefined}
          />

          {/* Cajón suizo brutalista */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* Cabecera geométrica del drawer */}
            <div
              className={`flex items-center justify-between border-b p-6 relative overflow-hidden ${headerClasses}`}
            >
              {/* Elementos Bauhaus estáticos de baja opacidad */}
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-full pointer-events-none" />
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 rotate-45 pointer-events-none" />
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none" />

              <div className="relative z-10">
                <span className="label-swiss !mb-0 !text-[9px] text-inherit">
                  Gestión de Accesos
                </span>
                <h2
                  id="drawer-title"
                  className="text-xl font-black uppercase tracking-tighter text-uecg-dark mt-0.5"
                >
                  {titles[mode]}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 relative z-10 text-uecg-gray hover:text-red-600 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-red-50 cursor-pointer"
                aria-label="Cerrar cajón"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
