import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import type { RudeFormValues } from "@/features/students/api/student.schema";

export default function StepGuardians() {
    const {
        register,
        watch,
        control,
        formState: { errors },
    } = useFormContext<RudeFormValues>();

    // 🔥 SOLUCIÓN ATÓMICA: Usamos 'replace' en lugar de remove dentro de un bucle
    const { fields, append, remove, replace } = useFieldArray({ control, name: "guardians" });

    const livesWith = watch("livesWith");

    // Función para pre-llenar los formularios en un solo renderizado sin colgar la UI
    const handleLivesWithChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;

        if (val === "PADRE_Y_MADRE") {
            replace([
                { relationship: "PADRE", ci: "", phone: "", names: "", lastNamePaterno: "" },
                { relationship: "MADRE", ci: "", phone: "", names: "", lastNamePaterno: "" },
            ]);
        } else if (val === "SOLO_PADRE") {
            replace([{ relationship: "PADRE", ci: "", phone: "", names: "", lastNamePaterno: "" }]);
        } else if (val === "SOLO_MADRE") {
            replace([{ relationship: "MADRE", ci: "", phone: "", names: "", lastNamePaterno: "" }]);
        } else if (val === "TUTOR") {
            replace([{ relationship: "TUTOR", ci: "", phone: "", names: "", lastNamePaterno: "" }]);
        } else if (val === "CENTRO_ACOGIDA") {
            replace([{ relationship: "TUTOR_EXTRAORDINARIO", ci: "", phone: "", names: "", lastNamePaterno: "" }]);
        } else {
            replace([]); // Limpia todo de golpe de forma segura
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black uppercase tracking-tight text-uecg-dark border-b border-uecg-line pb-2 mb-6 flex items-center gap-2">
                <span className="bg-uecg-dark text-white px-2 py-0.5 text-sm">V</span> Datos del Padre, Madre o Tutor(a)
            </h2>

            {/* 5.1 CON QUIÉN VIVE */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-8">
                <label className="label-swiss !mb-2 !text-[10px]">
                    5.1 El/La Estudiante vive habitualmente con: <span className="text-red-500">*</span>
                </label>

                {/* 🔥 SOLUCIÓN onChange NATIVO de React Hook Form */}
                <select
                    {...register("livesWith", {
                        onChange: handleLivesWithChange,
                    })}
                    className={`w-full border p-3 uppercase outline-none text-xs font-bold cursor-pointer ${errors.livesWith ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                >
                    <option value="">-- SELECCIONE --</option>
                    <option value="PADRE_Y_MADRE">1. PADRE Y MADRE</option>
                    <option value="SOLO_PADRE">2. SOLO PADRE</option>
                    <option value="SOLO_MADRE">3. SOLO MADRE</option>
                    <option value="TUTOR">4. TUTOR(A)</option>
                    <option value="SOLO">5. SOLO(A)</option>
                    <option value="CENTRO_ACOGIDA">6. EN TUTELA EXTRAORDINARIA (Centro de acogida)</option>
                </select>
                {errors.livesWith && (
                    <p className="text-[9px] font-bold text-red-500 uppercase mt-1">{errors.livesWith.message}</p>
                )}
            </div>

            {/* AVISO SI VIVE SOLO */}
            {livesWith === "SOLO" && (
                <div className="bg-yellow-50 border border-yellow-200 p-5 mb-8 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest">
                            Atención Legal
                        </p>
                        <p className="text-xs font-bold text-yellow-900 mt-1 uppercase">
                            Aunque el estudiante viva solo, para fines de inscripción escolar oficial debe registrar un
                            apoderado, garante o contacto de emergencia mayor de edad en el colegio.
                        </p>
                    </div>
                </div>
            )}

            {/* FORMULARIOS DINÁMICOS DE TUTORES (5.2 al 5.5) */}
            <div className="space-y-8">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="border border-uecg-line bg-white relative group transition-colors hover:border-uecg-blue shadow-sm"
                    >
                        <div className="bg-gray-100 px-4 py-2 border-b border-uecg-line flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                                {watch(`guardians.${index}.relationship`) === "PADRE"
                                    ? "5.2 DATOS DEL PADRE"
                                    : watch(`guardians.${index}.relationship`) === "MADRE"
                                      ? "5.3 DATOS DE LA MADRE"
                                      : watch(`guardians.${index}.relationship`) === "TUTOR_EXTRAORDINARIO"
                                        ? "5.5 TUTOR EXTRAORDINARIO"
                                        : "5.4 DATOS DEL TUTOR"}
                            </span>
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-1 outline-none"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Parentesco Oculto/Fijo o Selector si es "SOLO" */}
                            <div className="flex flex-col gap-1.5 md:col-span-12">
                                <label className="label-swiss !mb-0 !text-[10px]">Relación / Parentesco</label>
                                <select
                                    {...register(`guardians.${index}.relationship` as const)}
                                    className="w-full md:w-1/3 border border-uecg-line bg-gray-50 p-2 text-xs font-bold uppercase outline-none pointer-events-none"
                                >
                                    <option value="PADRE">PADRE</option>
                                    <option value="MADRE">MADRE</option>
                                    <option value="TUTOR">TUTOR (Apoderado)</option>
                                    <option value="TUTOR_EXTRAORDINARIO">TUTOR EXTRAORDINARIO (Centro)</option>
                                </select>
                            </div>

                            {/* Cédula */}
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    Cédula de Identidad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register(`guardians.${index}.ci` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                    placeholder="EJ: 1234567"
                                />
                                {errors?.guardians?.[index]?.ci && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.guardians[index]?.ci?.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="label-swiss !mb-0 !text-[10px]">Comp.</label>
                                <input
                                    {...register(`guardians.${index}.complement` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="label-swiss !mb-0 !text-[10px]">Exp.</label>
                                <select
                                    {...register(`guardians.${index}.expedition` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue cursor-pointer"
                                >
                                    <option value="">--</option>
                                    <option value="CH">CH</option>
                                    <option value="LP">LP</option>
                                    <option value="CB">CB</option>
                                    <option value="SC">SC</option>
                                    <option value="PT">PT</option>
                                    <option value="OR">OR</option>
                                    <option value="TJ">TJ</option>
                                    <option value="BE">BE</option>
                                    <option value="PD">PD</option>
                                </select>
                            </div>

                            {/* Nombres */}
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    Apellido Paterno <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register(`guardians.${index}.lastNamePaterno` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                                {errors?.guardians?.[index]?.lastNamePaterno && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.guardians[index]?.lastNamePaterno?.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">Apellido Materno</label>
                                <input
                                    {...register(`guardians.${index}.lastNameMaterno` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    Nombres <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register(`guardians.${index}.names` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                                {errors?.guardians?.[index]?.names && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.guardians[index]?.names?.message}
                                    </p>
                                )}
                            </div>

                            {/* Datos Extra (Idioma, Ocupación, Instrucción) */}
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">Idioma Frecuente</label>
                                <input
                                    {...register(`guardians.${index}.language` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                    placeholder="EJ: CASTELLANO"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">Ocupación Laboral Actual</label>
                                <input
                                    {...register(`guardians.${index}.occupation` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                    placeholder="EJ: COMERCIANTE"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                                <label className="label-swiss !mb-0 !text-[10px]">Grado de Instrucción</label>
                                <select
                                    {...register(`guardians.${index}.educationLevel` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue cursor-pointer"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="PRIMARIA">Primaria</option>
                                    <option value="SECUNDARIA">Secundaria</option>
                                    <option value="TECNICO">Técnico</option>
                                    <option value="UNIVERSITARIO">Universitario</option>
                                    <option value="NINGUNO">Ninguno</option>
                                </select>
                            </div>

                            {/* Fecha Nacimiento y Teléfono */}
                            <div className="flex flex-col gap-1.5 md:col-span-6">
                                <label className="label-swiss !mb-0 !text-[10px]">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    {...register(`guardians.${index}.birthDate` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-6">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    Teléfono / Celular <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register(`guardians.${index}.phone` as const)}
                                    className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                />
                                {errors?.guardians?.[index]?.phone && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.guardians[index]?.phone?.message}
                                    </p>
                                )}
                            </div>

                            {/* Solo para Tutor Extraordinario (5.5) */}
                            {watch(`guardians.${index}.relationship`) === "TUTOR_EXTRAORDINARIO" && (
                                <>
                                    <div className="flex flex-col gap-1.5 md:col-span-6 pt-4 border-t border-uecg-line">
                                        <label className="label-swiss !mb-0 !text-[10px]">
                                            Cargo Actual en la Institución
                                        </label>
                                        <input
                                            {...register(`guardians.${index}.jobTitle` as const)}
                                            className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 md:col-span-6 pt-4 border-t border-uecg-line">
                                        <label className="label-swiss !mb-0 !text-[10px]">
                                            Nombre de la Institución / Centro
                                        </label>
                                        <input
                                            {...register(`guardians.${index}.institution` as const)}
                                            className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none focus:border-uecg-blue"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* BOTÓN MANUAL PARA AÑADIR CONTACTO (Si viven solos) */}
            {(livesWith === "SOLO" || fields.length === 0) && (
                <button
                    type="button"
                    onClick={() => append({ relationship: "TUTOR", ci: "", phone: "", names: "", lastNamePaterno: "" })}
                    className="mt-6 w-full md:w-auto px-6 py-3 border border-dashed border-uecg-gray text-uecg-gray hover:text-uecg-blue hover:border-uecg-blue hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[11px] outline-none"
                >
                    <Plus className="w-4 h-4" /> Añadir Contacto de Emergencia / Apoderado
                </button>
            )}
        </div>
    );
}
