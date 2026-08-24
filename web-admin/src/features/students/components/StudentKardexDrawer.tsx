import { Loader2, FileText, User, Home, Phone, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DrawerShell } from "@/shared/ui/drawer-shell";
import { SwissCopyButton } from "@/shared/ui/swiss-copy-button";
import { EnrollmentsService } from "@/features/enrollments/api/enrollments.service";



interface StudentKardexDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string | null;
}

export default function StudentKardexDrawer({ isOpen, onClose, enrollmentId }: StudentKardexDrawerProps) {
  // Consultar datos del Kardex
  const { data: kardex, isLoading } = useQuery({
    queryKey: ["student_kardex", enrollmentId],
    queryFn: () => EnrollmentsService.getDetails(enrollmentId || ""),
    enabled: isOpen && !!enrollmentId,
  });

  if (!isOpen || !enrollmentId) return null;

  const student = kardex?.student || {};
  const rudeData = kardex?.rudeRecord || kardex?.rudeData || {};
  const guardians = student?.guardians || [];

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Kardex de Estudiante"
      kicker="Expediente Oficial RUDE"
      icon={<FileText className="w-5 h-5 text-white" />}
      headerVariant="dark"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Contenido */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-uecg-gray gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                Extrayendo expediente del sistema...
              </span>
            </div>
          ) : (
            <>
              {/* SECCIÓN I: IDENTIDAD */}
              <div className="bg-white p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> I. Datos de Identificación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Nombres</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">{student.names || "---"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Paterno</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">{student.lastNamePaterno || "---"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Materno</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">{student.lastNameMaterno || "---"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest block">Cédula de Identidad</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-black uppercase text-uecg-dark">
                        {student.ci} {student.complement ? `-${student.complement}` : ""} {student.expedition || ""}
                      </p>
                      {student.ci && <SwissCopyButton text={student.ci} size={11} successMessage="CI copiado" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest block">Código RUDE</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-black uppercase text-uecg-blue">{student.rudeCode || "SIN ASIGNAR"}</p>
                      {student.rudeCode && <SwissCopyButton text={student.rudeCode} size={11} successMessage="RUDE copiado" />}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Género</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">{student.gender || "---"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Fecha Nacimiento</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">
                      {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : "---"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Lugar Nacimiento</span>
                    <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">
                      {student.birthCountry || "BOLIVIA"} {student.birthDepartment ? ` - ${student.birthDepartment}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN II: DIRECCIÓN Y SOCIOECONOMÍA */}
              <div className="bg-white p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" /> II. Dirección y Aspectos Habitacionales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Dirección Domiciliaria</span>
                    <p className="text-xs font-bold uppercase text-uecg-dark mt-0.5">
                      {rudeData.street || "---"} {rudeData.houseNumber ? `N° ${rudeData.houseNumber}` : ""}
                    </p>
                    <p className="text-[10px] text-uecg-gray uppercase tracking-wider">
                      {rudeData.zone || "---"} - {rudeData.municipality || "---"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Contactos</span>
                    <p className="text-xs font-bold uppercase text-uecg-dark mt-0.5">Celular: {rudeData.cellphone || "---"}</p>
                    {rudeData.phone && <p className="text-xs font-bold uppercase text-uecg-dark mt-0.5">Teléfono: {rudeData.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 border-t border-gray-100 pt-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Agua potable</span>
                    <p className="text-xs font-bold uppercase mt-0.5">{rudeData.water ? "Sí" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Energía Eléctrica</span>
                    <p className="text-xs font-bold uppercase mt-0.5">{rudeData.electricity ? "Sí" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Alcantarillado</span>
                    <p className="text-xs font-bold uppercase mt-0.5">{rudeData.sewage ? "Sí" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Internet</span>
                    <p className="text-xs font-bold uppercase mt-0.5">
                      {rudeData.internetAccess && rudeData.internetAccess.length > 0 ? "Sí" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN III: DISCAPACIDADES Y SALUD */}
              {(student.hasDisability || student.hasAutism || student.hasExtraordinaryTalent) && (
                <div className="bg-white p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> III. Aspectos Médicos / Especiales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.hasDisability && (
                      <div>
                        <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">Discapacidad Registrada</span>
                        <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">
                          Tipo: {student.disabilityType} ({student.disabilityDegree || "LEVE"})
                        </p>
                        <p className="text-[9px] text-uecg-gray uppercase tracking-widest">Registro N°: {student.disabilityCode}</p>
                      </div>
                    )}
                    {student.hasAutism && (
                      <div>
                        <span className="text-[9px] font-black uppercase text-purple-600 tracking-widest">Diagnóstico TEA</span>
                        <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">TEA Tipo: {student.autismType}</p>
                      </div>
                    )}
                    {student.hasExtraordinaryTalent && (
                      <div>
                        <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Talento Extraordinario</span>
                        <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">Talento: {student.talentType} (IQ: {student.talentIQ})</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECCIÓN IV: TUTORES / APODERADOS */}
              <div className="bg-white p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> IV. Apoderados Autorizados
                </h3>
                {guardians.length === 0 ? (
                  <p className="text-[10px] font-bold text-uecg-gray uppercase">No hay tutores registrados.</p>
                ) : (
                  <div className="flex flex-col gap-4 divide-y divide-gray-100">
                    {guardians.map((g: any, i: number) => {
                      // El tutor puede estar plano o anidado según el desempaquetado de NestJS
                      const relationship = g.relationship;
                      const name = `${g.lastNamePaterno || ""} ${g.lastNameMaterno || ""} ${g.names || ""}`.trim();
                      const ci = g.ci || "Sin CI";
                      const phone = g.phone || "Sin Teléfono";
                      const occupation = g.occupation || "---";

                      return (
                        <div key={`guardian-${i}`} className={`flex flex-col gap-2 ${i > 0 ? "pt-3" : ""}`}>
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase text-uecg-dark">{name}</h4>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-uecg-dark text-white px-2 py-0.5">
                              {relationship}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[8px] font-bold uppercase text-uecg-gray tracking-wider">C.I.</span>
                              <p className="text-[11px] font-bold uppercase text-uecg-text mt-0.5">{ci}</p>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold uppercase text-uecg-gray tracking-wider">Teléfono</span>
                              <p className="text-[11px] font-bold uppercase text-uecg-text mt-0.5">{phone}</p>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold uppercase text-uecg-gray tracking-wider">Ocupación</span>
                              <p className="text-[11px] font-bold uppercase text-uecg-text mt-0.5">{occupation}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 dark:bg-zinc-900 flex shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-uecg-dark text-white hover:bg-black transition-colors shadow-sm outline-none cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </footer>
      </div>
    </DrawerShell>
  );
}

