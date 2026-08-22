import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, Save, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

// 1. Reutilizamos el Esquema y el Servicio de Estudiantes
import { rudeSchema } from "@/features/students/api/student.schema";
import type { RudeFormValues, RudePayload } from "@/features/students/api/student.schema";
import { StudentsService } from "@/features/students/api/students.service";
import { AcademicYearsService } from "@/features/academic-years/api/academic-years.service";

// 2. MAGIA FSD: Reutilizamos los MISMOS pasos del formulario público
import StepIdentity from "@/features/students/components/public-form/steps/StepIdentity";
import StepAddressSocio from "@/features/students/components/public-form/steps/StepAddressSocio";
import StepGuardians from "@/features/students/components/public-form/steps/StepGuardians";
import StepAcademic from "@/features/students/components/public-form/steps/StepAcademic";

const STEPS = [
  {
    id: 1,
    title: "Identidad",
    // Agregamos todos los obligatorios del paso 1
    fields: ["names", "lastNamePaterno", "birthDate", "gender", "birthCountry", "documentType"]
  },
  {
    id: 2,
    title: "Dirección y Socioeconomía",
    // 🔥 AQUÍ ESTABA EL HUECO: Agregamos cellphone, transportType, transportTime, etc.
    fields: ["department", "province", "municipality", "street", "cellphone", "nativeLanguage", "transportType", "transportTime"]
  },
  {
    id: 3,
    title: "Tutores",
    // Agregamos livesWith que está al principio de este paso
    fields: ["livesWith", "guardians"]
  },
  {
    id: 4,
    title: "Asignación",
    // Agregamos rudeCode por si es traspaso
    fields: ["classroomId", "enrollmentType", "rudeCode"]
  },
];

export default function AdminEnrollmentForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Obtenemos la gestión activa silenciosamente (No se la pedimos a la secretaria)
  const { data: currentYear, isLoading: isLoadingYear } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: AcademicYearsService.getCurrent,
  });

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

  // 🔥 SISTEMA DE RASTREO DE ERRORES (CHIVATO)
  const { errors } = methods.formState;
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("🛑 ERRORES DE VALIDACIÓN ZOD QUE BLOQUEAN EL SUBMIT:", errors);
    }
  }, [errors]);

  const mutation = useMutation({
    mutationFn: (data: RudePayload) => StudentsService.registerPublicRude(currentYear!.id, data),
    onSuccess: () => setIsSuccess(true),
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Ocurrió un error al registrar en ventanilla";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = STEPS.find((s) => s.id === currentStep)?.fields || [];
    const isStepValid = await methods.trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (isLoadingYear) {
    return (
      <div className="flex justify-center p-12 border border-uecg-line bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
      </div>
    );
  }

  if (!currentYear) {
    return (
      <div className="border border-red-200 bg-red-50 p-8 text-center mt-10">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-lg font-black uppercase tracking-tight text-red-600">No hay Gestión Activa</h2>
        <p className="text-xs font-bold text-uecg-text mt-2 uppercase tracking-widest leading-relaxed">
          Debe crear o activar una Gestión Académica antes de inscribir estudiantes.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-white p-10 border border-uecg-line text-center shadow-sm">
        <CheckCircle className="w-20 h-20 text-uecg-blue mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter text-uecg-dark">Registro Guardado</h2>
        <p className="mt-4 text-sm font-bold text-uecg-gray uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
          El formulario RUDE ha sido ingresado al sistema. La solicitud se encuentra en la bandeja para que
          ingrese el código oficial del SIE.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => {
              methods.reset();
              setCurrentStep(1);
              setIsSuccess(false);
            }}
            className="px-6 py-3 font-bold uppercase tracking-widest text-[11px] border border-uecg-line text-uecg-text hover:bg-gray-50 transition-colors"
          >
            Registrar Otro Alumno
          </button>
          <button
            onClick={() => navigate({ to: "/enrollments" })}
            className="px-6 py-3 font-bold uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-black transition-colors"
          >
            Ir a la Bandeja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-uecg-line shadow-sm flex flex-col">
      {/* Progress Bar Suizo */}
      <div className="flex bg-gray-100 border-b border-uecg-line">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex-1 p-3 text-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === step.id ? "bg-uecg-blue text-white" : "text-uecg-gray"}`}
          >
            {step.id}. {step.title}
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form
          // 🔥 SE AÑADE EL MANEJADOR ONERROR AQUÍ
          onSubmit={methods.handleSubmit(
            (data) => mutation.mutate(data as RudePayload),
            (formErrors) => {
              console.error("🛑 FORMULARIO RECHAZADO POR:", formErrors);
              toast.error("Faltan datos obligatorios o hay errores de formato. Revisa la consola (F12).");
            }
          )}
          className="p-8 flex-1 flex flex-col"
        >
          <div className="flex-1">
            {currentStep === 1 && <StepIdentity />}
            {currentStep === 2 && <StepAddressSocio />}
            {currentStep === 3 && <StepGuardians />}
            {/* Se inyecta la gestión silenciosamente al paso académico */}
            {currentStep === 4 && <StepAcademic academicYearId={currentYear.id} />}
          </div>

          <div className="mt-10 pt-6 border-t border-uecg-line flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-uecg-line font-bold uppercase tracking-widest text-xs text-uecg-gray hover:bg-gray-50 disabled:opacity-0 transition-colors flex items-center gap-2 outline-none"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-uecg-dark text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors flex items-center gap-2 outline-none"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-8 py-3 bg-uecg-blue text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 outline-none"
              >
                {mutation.isPending ? "Procesando..." : "Guardar Ficha Manual"}{" "}
                <Save className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
