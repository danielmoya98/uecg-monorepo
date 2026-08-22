import { CheckCircle2, FileText, Edit } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { UserFormValues } from '../schemas/user.schema'

interface UserFormProps {
  mode: 'create' | 'edit'
  register: UseFormRegister<UserFormValues>
  errors: FieldErrors<UserFormValues>
  fullNameValue: string
  generatedEmail: string
  generatedPassword?: string
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isGeneratingPDF: boolean
}

export default function UserForm({
  mode,
  register,
  errors,
  fullNameValue,
  generatedEmail,
  generatedPassword,
  onSubmit,
  isSubmitting,
  isGeneratingPDF,
}: UserFormProps) {
  const isProcessing = isSubmitting || isGeneratingPDF

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="user-fullname-input" className="label-swiss !text-[10px] !mb-1.5 block">
          Nombre Completo
        </label>
        <input
          id="user-fullname-input"
          type="text"
          placeholder="Ej. Carlos Mendoza"
          {...register('fullName')}
          className={`w-full border px-3 py-2.5 text-uecg-text focus:outline-none uppercase text-xs font-bold transition-colors shadow-sm bg-white ${
            errors.fullName
              ? 'border-red-500 focus:border-red-500'
              : 'border-uecg-line focus:border-uecg-blue'
          }`}
          required
          disabled={isProcessing}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullname-error' : undefined}
        />
        {errors.fullName && (
          <span
            id="fullname-error"
            className="text-[9px] text-red-600 font-bold uppercase tracking-wider mt-1.5 block"
          >
            {errors.fullName.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="user-role-select" className="label-swiss !text-[10px] !mb-1.5 block">
          Rol en el Sistema
        </label>
        <select
          id="user-role-select"
          {...register('role')}
          className={`w-full border px-3 py-2.5 text-uecg-text focus:outline-none uppercase text-[11px] font-bold cursor-pointer transition-colors shadow-sm bg-white ${
            errors.role
              ? 'border-red-500 focus:border-red-500'
              : 'border-uecg-line focus:border-uecg-blue'
          }`}
          disabled={isProcessing}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? 'role-error' : undefined}
        >
          <option value="DOCENTE">Plantel Docente (Web & App)</option>
          <option value="ADMIN">Administrador / Director</option>
        </select>
        {errors.role && (
          <span
            id="role-error"
            className="text-[9px] text-red-600 font-bold uppercase tracking-wider mt-1.5 block"
          >
            {errors.role.message}
          </span>
        )}
      </div>

      {mode === 'edit' && (
        <div>
          <label htmlFor="user-email-disabled" className="label-swiss !text-[10px] !mb-1.5 block">
            Correo Institucional (No editable)
          </label>
          <input
            id="user-email-disabled"
            type="text"
            value={generatedEmail}
            disabled
            className="w-full border border-uecg-line bg-gray-50 px-3 py-2.5 text-uecg-gray focus:outline-none font-bold text-xs cursor-not-allowed"
          />
        </div>
      )}

      {mode === 'create' && fullNameValue.length > 2 && (
        <div className="mt-2 bg-blue-50/50 border border-blue-100 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-uecg-blue mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Autogenerado
          </h3>
          <div className="space-y-3">
            <div>
              <p className="font-bold text-uecg-text text-sm truncate">{generatedEmail}</p>
            </div>
            {generatedPassword && (
              <div>
                <p className="font-mono bg-white border border-uecg-line px-2 py-1 inline-block font-bold tracking-widest text-xs">
                  {generatedPassword}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={fullNameValue.length < 3 || isProcessing}
        className="mt-4 px-6 py-3 font-bold uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
      >
        {mode === 'create' ? (
          <>
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" /> Crear y Exportar PDF
              </>
            )}
          </>
        ) : (
          <>
            {isSubmitting ? (
              'Guardando...'
            ) : (
              <>
                <Edit className="w-3.5 h-3.5" /> Guardar Cambios
              </>
            )}
          </>
        )}
      </button>
    </form>
  )
}
