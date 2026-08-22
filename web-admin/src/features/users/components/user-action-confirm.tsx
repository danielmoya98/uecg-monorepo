import { AlertTriangle, UserCheck, Key, Trash2 } from 'lucide-react'

interface UserActionConfirmProps {
  mode: 'delete' | 'reactivate' | 'reset'
  fullName: string
  onCancel: () => void
  onConfirm: () => void
  isSubmitting: boolean
  isGeneratingPDF?: boolean
}

const CONFIG_CLASSES = {
  delete: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
    iconText: 'text-red-600',
    btnBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
  },
  reactivate: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-700',
    iconText: 'text-green-600',
    btnBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-600',
  },
  reset: {
    border: 'border-yellow-200',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    iconText: 'text-yellow-600',
    btnBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600',
  },
}

export default function UserActionConfirm({
  mode,
  fullName,
  onCancel,
  onConfirm,
  isSubmitting,
  isGeneratingPDF,
}: UserActionConfirmProps) {
  // Diccionario de configuración visual según el modo (Patrón Strategy)
  const config = {
    delete: {
      icon: AlertTriangle,
      title: '¿DESACTIVAR USUARIO?',
      btnText: 'Desactivar',
      btnIcon: Trash2,
    },
    reactivate: {
      icon: UserCheck,
      title: '¿REACTIVAR USUARIO?',
      btnText: 'Reactivar',
      btnIcon: UserCheck,
    },
    reset: {
      icon: Key,
      title: '¿RESTAURAR CREDENCIALES?',
      btnText: 'Confirmar',
      btnIcon: Key,
    },
  }

  const { icon: Icon, title, btnText, btnIcon: BtnIcon } = config[mode]
  const classes = CONFIG_CLASSES[mode]
  const isProcessing = isSubmitting || isGeneratingPDF

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border ${classes.border} ${classes.bg} p-5 flex flex-col items-center text-center gap-3`}
      >
        <Icon className={`w-10 h-10 ${classes.iconText}`} />
        <div>
          <h3 className={`text-sm font-black uppercase tracking-tight ${classes.text}`}>{title}</h3>
          <p className="text-xs font-bold text-uecg-text mt-1.5 uppercase tracking-widest">{fullName}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] border border-uecg-line text-uecg-text hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer outline-none focus:ring-2 focus:ring-uecg-line"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className={`px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer outline-none focus:ring-2 ${classes.btnBg}`}
        >
          {isProcessing ? (
            'Procesando...'
          ) : (
            <>
              <BtnIcon className="w-3.5 h-3.5" /> {btnText}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
