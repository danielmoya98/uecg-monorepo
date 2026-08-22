import { Loader2, ShieldAlert, Save, Check } from 'lucide-react'
import { useRbacMatrix } from '../hooks/use-rbac-matrix'

export function RbacMatrix() {
  const {
    roles,
    isLoading,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    localPermissions,
    groupedPermissions,
    togglePermission,
    saveMatrix,
    isSaving,
  } = useRbacMatrix()

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-64 flex-col items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-uecg-dark animate-in fade-in duration-200"
      >
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-uecg-blue" />
        Analizando Matriz de Políticas...
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 border-t-[3px] border-uecg-dark pt-8 w-full">
      {/* 1. SECCIÓN IZQUIERDA: LISTA DE ENTIDADES (Master) */}
      <aside className="w-full lg:w-1/3 flex flex-col border-b-2 lg:border-b-0 lg:border-r-2 border-uecg-line pb-6 lg:pb-0 lg:pr-8 shrink-0">
        <div className="mb-6 border-b-2 border-uecg-dark pb-3">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-uecg-dark">
            Entidades
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-uecg-gray mt-1.5">
            Seleccione un perfil para configurar
          </p>
        </div>

        <nav aria-label="Perfiles del sistema">
          <ul role="list" className="flex flex-col gap-1 w-full">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id
              return (
                <li key={role.id} className="w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`text-left p-4.5 border-b border-uecg-line w-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-uecg-dark text-white shadow-md'
                        : 'hover:bg-gray-50 text-uecg-dark bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-uecg-blue`}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-label={`Ver permisos del perfil ${role.name}`}
                  >
                    <div className="text-[14px] font-black uppercase tracking-tight">
                      {role.name.replace(/_/g, ' ')}
                    </div>
                    <div
                      className={`text-[9px] uppercase tracking-widest font-bold mt-1.5 ${
                        isSelected ? 'text-gray-300' : 'text-uecg-gray'
                      }`}
                    >
                      {role.permissions.length} Permisos activos
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* 2. SECCIÓN DERECHA: MATRIZ DE PERMISOS (Detail) */}
      <section className="w-full lg:w-2/3 flex flex-col flex-1" aria-labelledby="matrix-detail-title">
        {!selectedRoleId ? (
          <div className="h-64 lg:h-full flex flex-col items-center justify-center text-uecg-gray opacity-60 border-2 border-dashed border-uecg-line p-12 bg-gray-50/50">
            <ShieldAlert className="h-16 w-16 mb-4 stroke-[1px] text-uecg-gray/80" aria-hidden="true" />
            <h3 id="matrix-detail-title" className="text-sm font-black uppercase tracking-widest text-center">
              Matriz de Permisos Inactiva
            </h3>
            <p className="text-[10px] text-uecg-gray/85 mt-2 text-center uppercase tracking-wide">
              Seleccione un perfil del panel de entidades para auditar o alterar privilegios.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 flex flex-col w-full">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b-2 border-uecg-dark pb-4">
              <div>
                <h2 id="matrix-detail-title" className="text-3xl font-black uppercase tracking-tighter leading-none text-uecg-dark">
                  {selectedRole?.name.replace(/_/g, ' ')}
                </h2>
                <p className="text-[10px] font-mono mt-2 text-uecg-gray uppercase tracking-widest">
                  ID de Registro: {selectedRole?.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => saveMatrix()}
                disabled={isSaving || selectedRole?.name === 'SUPER_ADMIN'}
                className="flex items-center gap-2.5 bg-uecg-dark text-white px-6 py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-uecg-blue disabled:opacity-40 disabled:hover:bg-uecg-dark disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-uecg-blue cursor-pointer"
                aria-label={`Grabar cambios de matriz para ${selectedRole?.name}`}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <Save className="h-3.5 w-3.5 shrink-0" />
                )}
                Grabar Matriz
              </button>
            </header>

            {/* Grid de módulos en Estilo Suizo Brutalista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <fieldset
                  key={moduleName}
                  className="border-[3px] border-uecg-dark p-5 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4"
                >
                  <legend className="sr-only">{moduleName}</legend>
                  <h3 className="text-xs font-black uppercase tracking-widest border-b border-uecg-line pb-2.5 text-uecg-dark">
                    {moduleName}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {perms.map((p) => {
                      const isChecked = localPermissions.has(p.id)
                      const isSuperAdminRole = selectedRole?.name === 'SUPER_ADMIN'

                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 cursor-pointer group text-left w-full p-2 hover:bg-blue-50/10 focus-within:bg-blue-50/20 rounded-sm transition-colors ${
                            isSuperAdminRole ? 'pointer-events-none opacity-90' : ''
                          }`}
                        >
                          <div className="pt-0.5 shrink-0">
                            {/* Checkbox Brutalista Custom Accesible */}
                            <div
                              className={`w-5 h-5 border-[3px] flex items-center justify-center transition-all duration-150 ${
                                isChecked
                                  ? 'bg-uecg-dark border-uecg-dark scale-105'
                                  : 'bg-transparent border-uecg-dark group-hover:bg-gray-100'
                              } group-focus-within:ring-2 group-focus-within:ring-uecg-blue`}
                            >
                              {isChecked && (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                              )}
                            </div>
                            {/* Input Nativo con enfoque ARIA */}
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isChecked}
                              disabled={isSuperAdminRole}
                              onChange={() => togglePermission(p.id)}
                              aria-label={`Conceder permiso de ${p.name} en el módulo ${moduleName}`}
                            />
                          </div>

                          <div className="flex flex-col select-none">
                            <span className="text-[11px] font-black uppercase tracking-wider text-uecg-dark leading-none">
                              {p.name}
                            </span>
                            <span className="text-[9px] text-uecg-gray uppercase leading-relaxed mt-1 font-bold">
                              {p.desc}
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
