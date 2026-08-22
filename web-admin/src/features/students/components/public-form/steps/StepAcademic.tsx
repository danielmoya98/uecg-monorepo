import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { RudeFormValues } from "@/features/students/api/student.schema";
import { ClassroomsService } from "@/features/classrooms/api/classrooms.service";

function CourseSelector({ academicYearId }: { academicYearId: string }) {
    const {
        register,
        formState: { errors },
    } = useFormContext<RudeFormValues>();

    const { data, isLoading } = useQuery({
        queryKey: ["classrooms_enrollment", academicYearId],
        queryFn: () => ClassroomsService.getAll(1, 100, "", academicYearId),
        enabled: !!academicYearId,
    });

    if (isLoading) {
        return (
            <div className="border border-uecg-line p-3 bg-gray-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-uecg-blue">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando Cursos...
            </div>
        );
    }

    const classrooms = data?.data || [];

    return (
        <select
            {...register("classroomId")}
            className={`w-full border p-3 uppercase outline-none text-xs font-bold cursor-pointer transition-colors ${errors.classroomId ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
        >
            <option value="">-- SELECCIONE UN CURSO --</option>
            {classrooms.map((c: any) => (
                <option key={c.id} value={c.id}>
                    {c.level} - {c.grade} "{c.section}" (Turno {c.shift})
                </option>
            ))}
        </select>
    );
}

export default function StepAcademic({ academicYearId }: { academicYearId: string }) {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<RudeFormValues>();

    const currentType = watch("enrollmentType");

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black uppercase tracking-tight text-uecg-dark border-b border-uecg-line pb-2 mb-6 flex items-center gap-2">
                <span className="bg-uecg-dark text-white px-2 py-0.5 text-sm">VI</span> Asignación Académica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            Tipo de Inscripción <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("enrollmentType")}
                            className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer transition-colors"
                        >
                            <option value="NUEVO">ESTUDIANTE NUEVO</option>
                            <option value="ANTIGUO">ESTUDIANTE ANTIGUO</option>
                            <option value="TRASPASO">TRASPASO (DE OTRO COLEGIO)</option>
                            {/* 🔥 Añadido el estado Extranjero */}
                            <option value="EXTRANJERO">ESTUDIANTE EXTRANJERO</option>
                        </select>

                        {/* 🔥 Mensajes dinámicos según el tipo seleccionado */}
                        <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-1 min-h-[14px]">
                            {currentType === "TRASPASO" && "Nota: Debe entregar libreta original en secretaría."}
                            {currentType === "EXTRANJERO" && "Nota: Requiere documentos académicos legalizados."}
                            {currentType === "NUEVO" && "Nota: Requiere certificado de nacimiento original."}
                        </p>
                    </div>

                    {/* RENDERIZADO CONDICIONAL: Solo aparece si eligen TRASPASO */}
                    {currentType === "TRASPASO" && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                            <label className="label-swiss !mb-0 !text-[10px]">
                                Código RUDE Actual <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("rudeCode")}
                                className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.rudeCode ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                                placeholder="EJ: 8073014520210001"
                            />
                            {errors.rudeCode && (
                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                                    {errors.rudeCode.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Seleccione el Curso a Postular <span className="text-red-500">*</span>
                    </label>
                    <CourseSelector academicYearId={academicYearId} />
                    {errors.classroomId && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                            {errors.classroomId.message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
