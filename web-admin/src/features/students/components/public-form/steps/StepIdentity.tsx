import { useFormContext } from "react-hook-form";
import type { RudeFormValues } from "@/features/students/api/student.schema";

export default function StepIdentity() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<RudeFormValues>();

    const hasDisability = watch("hasDisability");
    const birthCountry = watch("birthCountry");
    const documentType = watch("documentType");

    // Observadores para los nuevos bloques
    const hasAutism = watch("hasAutism");
    const learningStatus = watch("learningDisabilityStatus");
    const hasTalent = watch("hasExtraordinaryTalent");
    const talentType = watch("talentType");

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black uppercase tracking-tight text-uecg-dark border-b border-uecg-line pb-2 mb-6 flex items-center gap-2">
                <span className="bg-uecg-dark text-white px-2 py-0.5 text-sm">II</span> Datos de la o el Estudiante
            </h2>

            {/* 2.1 APELLIDOS Y NOMBRES */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("lastNamePaterno")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.lastNamePaterno ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: PEREZ"
                    />
                    {errors.lastNamePaterno && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.lastNamePaterno.message}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">Apellido Materno</label>
                    <input
                        {...register("lastNameMaterno")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold transition-colors focus:border-uecg-blue"
                        placeholder="EJ: GOMEZ"
                    />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Nombre(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("names")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.names ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: JUAN CARLOS"
                    />
                    {errors.names && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.names.message}
                        </p>
                    )}
                </div>
            </div>

            {/* 2.2 LUGAR DE NACIMIENTO Y 2.4 FECHA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
                <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="label-swiss !mb-0 !text-[10px]">País de Nacimiento</label>
                    <select
                        {...register("birthCountry")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
                    >
                        <option value="BOLIVIA">BOLIVIA</option>
                        <option value="ARGENTINA">ARGENTINA</option>
                        <option value="BRASIL">BRASIL</option>
                        <option value="CHILE">CHILE</option>
                        <option value="ESPAÑA">ESPAÑA</option>
                        <option value="ESTADOS UNIDOS">ESTADOS UNIDOS</option>
                        <option value="OTRO">OTRO</option>
                    </select>
                </div>

                {birthCountry === "BOLIVIA" && (
                    <div className="flex flex-col gap-1.5 md:col-span-3 animate-in fade-in">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            Departamento <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("birthDepartment")}
                            className={`w-full border p-3 uppercase outline-none text-xs font-bold cursor-pointer ${errors.birthDepartment ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        >
                            <option value="">Seleccione...</option>
                            <option value="CHUQUISACA">CHUQUISACA</option>
                            <option value="LA PAZ">LA PAZ</option>
                            <option value="COCHABAMBA">COCHABAMBA</option>
                            <option value="SANTA CRUZ">SANTA CRUZ</option>
                            <option value="POTOSI">POTOSÍ</option>
                            <option value="ORURO">ORURO</option>
                            <option value="TARIJA">TARIJA</option>
                            <option value="BENI">BENI</option>
                            <option value="PANDO">PANDO</option>
                        </select>
                        {errors.birthDepartment && (
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                                {errors.birthDepartment.message}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="label-swiss !mb-0 !text-[10px]">Provincia / Localidad</label>
                    <input
                        {...register("birthProvince")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue"
                        placeholder="EJ: OROPEZA, SUCRE"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register("birthDate")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.birthDate ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                    />
                    {errors.birthDate && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.birthDate.message}
                        </p>
                    )}
                </div>
            </div>

            {/* 2.3 CERTIFICADO DE NACIMIENTO (Obligatorio para cotejo) */}
            <div className="border border-uecg-line p-4 bg-gray-50 mb-6">
                <span className="label-swiss !mb-3 !text-[10px] border-b border-uecg-line pb-2 block">
                    2.3 Datos del Certificado de Nacimiento
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
                            Oficialía N°
                        </label>
                        <input
                            {...register("certOficialia")}
                            className="border border-uecg-line p-2 text-xs font-bold focus:border-uecg-blue outline-none uppercase"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
                            Libro N°
                        </label>
                        <input
                            {...register("certLibro")}
                            className="border border-uecg-line p-2 text-xs font-bold focus:border-uecg-blue outline-none uppercase"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
                            Partida N°
                        </label>
                        <input
                            {...register("certPartida")}
                            className="border border-uecg-line p-2 text-xs font-bold focus:border-uecg-blue outline-none uppercase"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
                            Folio N°
                        </label>
                        <input
                            {...register("certFolio")}
                            className="border border-uecg-line p-2 text-xs font-bold focus:border-uecg-blue outline-none uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* 2.5 IDENTIFICACIÓN Y 2.7 SEXO */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
                <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="label-swiss !mb-0 !text-[10px]">Tipo Documento</label>
                    <select
                        {...register("documentType")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
                    >
                        <option value="CI">CÉDULA IDENTIDAD (CI)</option>
                        <option value="PASAPORTE">PASAPORTE</option>
                        <option value="DNI">DNI (EXTRANJERO)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="label-swiss !mb-0 !text-[10px]">Nro. Documento</label>
                    <input
                        {...register("ci")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue"
                        placeholder="EJ: 1234567"
                    />
                </div>

                {documentType === "CI" && (
                    <>
                        <div className="flex flex-col gap-1.5 md:col-span-2 animate-in fade-in">
                            <label className="label-swiss !mb-0 !text-[10px]">Comp.</label>
                            <input
                                {...register("complement")}
                                className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue"
                                placeholder="1E"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2 animate-in fade-in">
                            <label className="label-swiss !mb-0 !text-[10px]">Exp.</label>
                            <select
                                {...register("expedition")}
                                className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
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
                    </>
                )}

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Género <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("gender")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
                    >
                        <option value="MASCULINO">MASCULINO</option>
                        <option value="FEMENINO">FEMENINO</option>
                    </select>
                </div>
            </div>

            {/* 2.8 BLOQUE DE DISCAPACIDAD */}
            <div className="border border-uecg-line p-5 bg-gray-50 transition-colors hover:border-uecg-blue mb-4">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        {...register("hasDisability")}
                        id="hasDisability"
                        className="mt-1 w-5 h-5 border-uecg-line text-uecg-blue cursor-pointer"
                    />
                    <div>
                        <label
                            htmlFor="hasDisability"
                            className="text-xs font-black uppercase tracking-tight text-uecg-dark cursor-pointer"
                        >
                            2.8 ¿El o la estudiante presenta alguna discapacidad?
                        </label>
                        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
                            Marque si posee carnet CODEPEDIS / IBC.
                        </p>
                    </div>
                </div>

                {hasDisability && (
                    <div className="mt-6 pt-6 border-t border-uecg-line animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="label-swiss !mb-0 !text-[10px]">2.8.1 Carnet de Discapacidad</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="CODEPEDIS" {...register("disabilityRegistry")} />{" "}
                                        CODEPEDIS
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="IBC" {...register("disabilityRegistry")} /> IBC
                                    </label>
                                </div>
                                <input
                                    {...register("disabilityCode")}
                                    className={`border p-2 text-xs font-bold uppercase outline-none ${errors.disabilityCode ? "border-red-500 bg-red-50" : "border-uecg-line focus:border-uecg-blue"}`}
                                    placeholder="NRO DE CARNET"
                                />
                                {errors.disabilityCode && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.disabilityCode.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    2.8.3 Origen de la Discapacidad
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="DE_NACIMIENTO" {...register("disabilityOrigin")} />{" "}
                                        De Nacimiento
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="ADQUIRIDA" {...register("disabilityOrigin")} />{" "}
                                        Adquirida
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:col-span-2">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    2.8.2 Tipo de Discapacidad Principal
                                </label>
                                <select
                                    {...register("disabilityType")}
                                    className={`w-full md:w-1/2 border p-3 text-xs font-bold uppercase outline-none cursor-pointer ${errors.disabilityType ? "border-red-500 bg-red-50" : "border-uecg-line focus:border-uecg-blue"}`}
                                >
                                    <option value="">-- SELECCIONE TIPO --</option>
                                    <option value="AUDITIVA">AUDITIVA</option>
                                    <option value="VISUAL">VISUAL (Ceguera / Baja Visión)</option>
                                    <option value="INTELECTUAL">INTELECTUAL</option>
                                    <option value="FISICA_MOTORA">FÍSICA-MOTORA</option>
                                    <option value="MENTAL_PSIQUICA">MENTAL O PSÍQUICA</option>
                                    <option value="MULTIPLE">MÚLTIPLE</option>
                                </select>
                                {errors.disabilityType && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.disabilityType.message}
                                    </p>
                                )}

                                <label className="label-swiss !mb-0 !text-[10px] mt-2">Grado de Discapacidad</label>
                                <select
                                    {...register("disabilityDegree")}
                                    className="w-full md:w-1/2 border border-uecg-line bg-white p-3 text-xs font-bold uppercase outline-none focus:border-uecg-blue cursor-pointer"
                                >
                                    <option value="">-- SELECCIONE GRADO --</option>
                                    <option value="LEVE">LEVE</option>
                                    <option value="MODERADO">MODERADO</option>
                                    <option value="GRAVE">GRAVE</option>
                                    <option value="MUY_GRAVE">MUY GRAVE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2.9 TEA (AUTISMO) */}
            <div className="border border-uecg-line p-5 bg-gray-50 transition-colors hover:border-uecg-blue mb-4">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        {...register("hasAutism")}
                        id="hasAutism"
                        className="mt-1 w-5 h-5 border-uecg-line text-uecg-blue cursor-pointer"
                    />
                    <div>
                        <label
                            htmlFor="hasAutism"
                            className="text-xs font-black uppercase tracking-tight text-uecg-dark cursor-pointer"
                        >
                            2.9 ¿El o la estudiante tiene diagnóstico de TEA?
                        </label>
                    </div>
                </div>
                {hasAutism && (
                    <div className="mt-4 pt-4 border-t border-uecg-line animate-in slide-in-from-top-2">
                        <label className="label-swiss !mb-2 !text-[10px]">
                            2.9.1 Tipo de Trastorno del Espectro Autista:
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                <input type="radio" value="TIPO_1" {...register("autismType")} /> Tipo 1
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                <input type="radio" value="TIPO_2" {...register("autismType")} /> Tipo 2
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                <input type="radio" value="TIPO_3" {...register("autismType")} /> Tipo 3
                            </label>
                        </div>
                        {errors.autismType && (
                            <p className="text-[9px] font-bold text-red-500 uppercase mt-1">
                                {errors.autismType.message}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* 2.10 DIFICULTADES EN EL APRENDIZAJE */}
            <div className="border border-uecg-line p-5 bg-gray-50 transition-colors hover:border-uecg-blue mb-4">
                <label className="text-xs font-black uppercase tracking-tight text-uecg-dark block mb-3">
                    2.10 ¿El o la estudiante presenta dificultades en el aprendizaje?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input type="radio" value="DIAGNOSTICO" {...register("learningDisabilityStatus")} /> Sí (Con
                        diagnóstico)
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input type="radio" value="INFORME" {...register("learningDisabilityStatus")} /> Sí (Con informe
                        pedag.)
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input type="radio" value="SIN_DIAGNOSTICO" {...register("learningDisabilityStatus")} /> Sí (Sin
                        diagnóstico)
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input type="radio" value="NO" {...register("learningDisabilityStatus")} /> No presenta
                    </label>
                </div>

                {learningStatus && learningStatus !== "NO" && (
                    <div className="mt-4 pt-4 border-t border-uecg-line animate-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-swiss !mb-2 !text-[10px]">
                                2.10.1 Tipo de dificultades (Puede marcar más de una):
                            </label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input
                                        type="checkbox"
                                        value="LECTURA_ESCRITURA"
                                        {...register("learningDisabilityTypes")}
                                    />{" "}
                                    Lectura y escritura
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input
                                        type="checkbox"
                                        value="RAZONAMIENTO"
                                        {...register("learningDisabilityTypes")}
                                    />{" "}
                                    Razonamiento verbal y lógico
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input type="checkbox" value="CALCULO" {...register("learningDisabilityTypes")} />{" "}
                                    Cálculo matemático
                                </label>
                            </div>
                            {errors.learningDisabilityTypes && (
                                <p className="text-[9px] font-bold text-red-500 uppercase mt-1">
                                    {errors.learningDisabilityTypes.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="label-swiss !mb-2 !text-[10px]">2.10.2 Lugar donde recibe apoyo:</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input
                                        type="checkbox"
                                        value="UNIDAD_EDUCATIVA"
                                        {...register("learningSupportLocation")}
                                    />{" "}
                                    En la Unidad Educativa
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input
                                        type="checkbox"
                                        value="CENTRO_ESPECIAL"
                                        {...register("learningSupportLocation")}
                                    />{" "}
                                    Centro de Educación Especial
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input type="checkbox" value="OTRA" {...register("learningSupportLocation")} /> Otra
                                    Institución
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                    <input type="checkbox" value="NINGUNO" {...register("learningSupportLocation")} />{" "}
                                    No recibe apoyo
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2.11 TALENTO EXTRAORDINARIO */}
            <div className="border border-uecg-line p-5 bg-gray-50 transition-colors hover:border-uecg-blue mb-4">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        {...register("hasExtraordinaryTalent")}
                        id="hasExtraordinaryTalent"
                        className="mt-1 w-5 h-5 border-uecg-line text-uecg-blue cursor-pointer"
                    />
                    <div>
                        <label
                            htmlFor="hasExtraordinaryTalent"
                            className="text-xs font-black uppercase tracking-tight text-uecg-dark cursor-pointer"
                        >
                            2.11 ¿El o la estudiante cuenta con informe que acredite talento extraordinario?
                        </label>
                    </div>
                </div>

                {hasTalent && (
                    <div className="mt-4 pt-4 border-t border-uecg-line animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="label-swiss !mb-0 !text-[10px]">
                                    2.11.1 Tipo de Talento Extraordinario
                                </label>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="GENERAL" {...register("talentType")} /> General
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="ESPECIFICO" {...register("talentType")} /> Específico
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase">
                                        <input type="radio" value="DOBLE_EXCEPCIONALIDAD" {...register("talentType")} />{" "}
                                        Doble excepcionalidad
                                    </label>
                                </div>
                                {errors.talentType && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase">
                                        {errors.talentType.message}
                                    </p>
                                )}

                                {talentType === "ESPECIFICO" && (
                                    <div className="ml-4 pl-4 border-l-2 border-uecg-blue flex flex-col gap-2 animate-in fade-in">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                            <input type="checkbox" value="ARTISTICO" {...register("talentSpecifics")} />{" "}
                                            Artístico
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                            <input
                                                type="checkbox"
                                                value="HUMANISTICO"
                                                {...register("talentSpecifics")}
                                            />{" "}
                                            Humanístico
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                            <input type="checkbox" value="MUSICAL" {...register("talentSpecifics")} />{" "}
                                            Musical
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                            <input type="checkbox" value="DEPORTIVO" {...register("talentSpecifics")} />{" "}
                                            Deportivo
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                            <input
                                                type="checkbox"
                                                value="CIENTIFICO"
                                                {...register("talentSpecifics")}
                                            />{" "}
                                            Científico Tecnológico
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="label-swiss !mb-0 !text-[10px]">
                                        Coeficiente Intelectual (CI) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("talentIQ")}
                                        className={`border p-3 text-xs font-bold uppercase outline-none ${errors.talentIQ ? "border-red-500 bg-red-50" : "border-uecg-line focus:border-uecg-blue"}`}
                                        placeholder="EJ: 130"
                                    />
                                    {errors.talentIQ && (
                                        <p className="text-[9px] font-bold text-red-500 uppercase">
                                            {errors.talentIQ.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="label-swiss !mb-0 !text-[10px]">
                                        2.11.2 Modalidad de Atención (Especial)
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                        <input type="checkbox" value="TUTORIA_EXTRA" {...register("talentModality")} />{" "}
                                        Tutorías extracurriculares
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                        <input
                                            type="checkbox"
                                            value="ADAPTACION_CURRICULAR"
                                            {...register("talentModality")}
                                        />{" "}
                                        Adaptaciones curriculares
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                        <input type="checkbox" value="ACELERACION" {...register("talentModality")} />{" "}
                                        Aceleración educativa
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
