import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, Send, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { rudeSchema } from "@/features/students/api/student.schema";
import type { RudeFormValues } from "@/features/students/api/student.schema";
import { StudentsService } from "@/features/students/api/students.service";

// Componentes de cada paso
import StepIdentity from "./steps/StepIdentity";
import StepAddressSocio from "./steps/StepAddressSocio";
import StepGuardians from "./steps/StepGuardians";
import StepAcademic from "./steps/StepAcademic";

const STEPS = [
  {
    id: 1,
    title: "Identidad",
    fields: ["names", "lastNamePaterno", "birthDate", "gender", "birthCountry", "documentType"]
  },
  {
    id: 2,
    title: "Dirección y Socioeconomía",
    fields: ["department", "province", "municipality", "street", "cellphone", "nativeLanguage", "transportType", "transportTime"],
  },
  {
    id: 3,
    title: "Tutores",
    fields: ["livesWith", "guardians"]
  },
  {
    id: 4,
    title: "Asignación",
    fields: ["classroomId", "enrollmentType", "rudeCode"]
  },
];

export default function PublicEnrollmentForm({ academicYearId }: { academicYearId: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const methods = useForm<RudeFormValues>({
    resolver: zodResolver(rudeSchema),
    defaultValues: {
      enrollmentType: "NUEVO",
      gender: "MASCULINO",
      hasDisability: false,
      guardians: [{ ci: "", names: "", lastNamePaterno: "", relationship: "PADRE", phone: "" }],
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (data: RudeFormValues) => StudentsService.registerPublicRude(academicYearId, data),
    onSuccess: () => setIsSuccess(true),
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Ocurrió un error en la inscripción";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = STEPS.find((s) => s.id === currentStep)?.fields || [];
    const isStepValid = await methods.trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 border border-uecg-line text-center max-w-lg shadow-sm">
          <CheckCircle className="w-20 h-20 text-uecg-blue mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-uecg-dark">Registro Enviado</h1>
          <div className="mt-6 bg-blue-50 border border-blue-200 p-5 text-left">
            <p className="text-xs font-bold text-uecg-dark uppercase tracking-widest mb-2">
              Siguientes Pasos Obligatorios:
            </p>
            <ol className="text-[11px] text-uecg-gray font-bold uppercase tracking-wider list-decimal pl-4 space-y-2">
              <li>Acérquese a la ventanilla de Secretaría del colegio.</li>
              <li>
                <strong>NO es necesario imprimir este formulario.</strong> Nosotros lo imprimiremos por
                usted para su respectiva Firma y Huella Dactilar.
              </li>
              <li>
                Debe entregar la <strong>Documentación Física</strong> en fólder (Certificado de
                Nacimiento, CI, Carnet de Vacunas y Libreta si corresponde).
              </li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-uecg-dark text-white font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center w-full">
      <div className="w-full max-w-4xl bg-white border border-uecg-line shadow-sm flex flex-col">
        <header className="bg-uecg-dark text-white p-8 border-b-4 border-uecg-blue text-center">
          <span className="text-[10px] font-bold text-uecg-line uppercase tracking-widest">
            Ministerio de Educación • Formulario RUDE 2026
          </span>
          <h1 className="text-4xl mt-2 font-black tracking-tighter uppercase">Pre-Inscripción Escolar</h1>
        </header>

        <div className="flex bg-gray-100 border-b border-uecg-line">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 p-3 text-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === step.id ? "bg-uecg-blue text-white" : "text-uecg-gray"}`}
            >
              Paso {step.id}: {step.title}
            </div>
          ))}
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
            className="p-8 flex-1 flex flex-col"
          >
            <div className="flex-1">
              {currentStep === 1 && <StepIdentity />}
              {currentStep === 2 && <StepAddressSocio />}
              {currentStep === 3 && <StepGuardians />}
              {currentStep === 4 && <StepAcademic academicYearId={academicYearId} />}
            </div>

            <div className="mt-10 pt-6 border-t border-uecg-line flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-uecg-line font-bold uppercase tracking-widest text-xs text-uecg-gray hover:bg-gray-50 disabled:opacity-0 transition-colors flex items-center gap-2 outline-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-uecg-dark text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors flex items-center gap-2 outline-none cursor-pointer"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8 py-3 bg-uecg-blue text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 outline-none cursor-pointer"
                >
                  {mutation.isPending ? "Procesando..." : "Enviar Formulario"}{" "}
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
