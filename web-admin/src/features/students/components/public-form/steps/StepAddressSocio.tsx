import { useFormContext } from "react-hook-form";
import type { RudeFormValues } from "@/features/students/api/student.schema";

export default function StepAddressSocio() {
    // 🔥 Se añadió 'watch' al hook para controlar la visualización de los nuevos bloques
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<RudeFormValues>();

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* SECCIÓN III: DIRECCIÓN ACTUAL */}
            <h2 className="text-lg font-black uppercase tracking-tight text-uecg-dark border-b border-uecg-line pb-2 mb-6 flex items-center gap-2">
                <span className="bg-uecg-dark text-white px-2 py-0.5 text-sm">III</span> Dirección Actual de la o el
                Estudiante
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10">
                {/* Fila 1: Depto, Provincia, Municipio */}
                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("department")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors cursor-pointer ${errors.department ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
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
                    {errors.department && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.department.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("province")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.province ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: OROPEZA"
                    />
                    {errors.province && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.province.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Sección / Municipio <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("municipality")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.municipality ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: SUCRE"
                    />
                    {errors.municipality && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.municipality.message}
                        </p>
                    )}
                </div>

                {/* Fila 2: Localidad y Zona */}
                <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="label-swiss !mb-0 !text-[10px]">Localidad / Comunidad</label>
                    <input
                        {...register("locality")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold transition-colors focus:border-uecg-blue"
                        placeholder="EJ: SUCRE"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="label-swiss !mb-0 !text-[10px]">Zona / Villa</label>
                    <input
                        {...register("zone")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold transition-colors focus:border-uecg-blue"
                        placeholder="EJ: BARRIO PETROLERO"
                    />
                </div>

                {/* Fila 3: Calle y Número */}
                <div className="flex flex-col gap-1.5 md:col-span-8">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Avenida / Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("street")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.street ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: CALLE JUNÍN"
                    />
                    {errors.street && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.street.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="label-swiss !mb-0 !text-[10px]">N° Vivienda</label>
                    <input
                        {...register("houseNumber")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold transition-colors focus:border-uecg-blue"
                        placeholder="EJ: 123 o S/N"
                    />
                </div>

                {/* Fila 4: Teléfonos */}
                <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="label-swiss !mb-0 !text-[10px]">Teléfono Fijo</label>
                    <input
                        {...register("phone")}
                        className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold transition-colors focus:border-uecg-blue"
                        placeholder="EJ: 6451234"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="label-swiss !mb-0 !text-[10px]">
                        Celular de Contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("cellphone")}
                        className={`w-full border p-3 uppercase outline-none text-xs font-bold transition-colors ${errors.cellphone ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                        placeholder="EJ: 71234567"
                    />
                    {errors.cellphone && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            {errors.cellphone.message}
                        </p>
                    )}
                </div>
            </div>

            {/* SECCIÓN IV: ASPECTOS SOCIOECONÓMICOS */}
            <h2 className="text-lg font-black uppercase tracking-tight text-uecg-dark border-b border-uecg-line pb-2 mb-6 flex items-center gap-2 mt-8">
                <span className="bg-uecg-dark text-white px-2 py-0.5 text-sm">IV</span> Aspectos Socioeconómicos de la o
                el Estudiante
            </h2>

            {/* 4.1 IDIOMA Y CULTURA */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-4">
                <span className="label-swiss !mb-4 !text-[10px] border-b border-uecg-line pb-2 block">
                    4.1 Idioma y Autoidentificación Cultural
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            4.1.1 Idioma que aprendió a hablar en la niñez <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("nativeLanguage")}
                            className={`w-full border p-2 uppercase outline-none text-xs font-bold transition-colors ${errors.nativeLanguage ? "border-red-500 bg-red-50" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                            placeholder="EJ: CASTELLANO"
                        />
                        {errors.nativeLanguage && (
                            <p className="text-[9px] font-bold text-red-500 uppercase">
                                {errors.nativeLanguage.message}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            4.1.2 ¿Qué idiomas habla frecuentemente?
                        </label>
                        <input
                            {...register("frequentLanguages")}
                            className="w-full border p-2 uppercase outline-none text-xs font-bold transition-colors border-uecg-line bg-white focus:border-uecg-blue"
                            placeholder="EJ: CASTELLANO, QUECHUA, INGLÉS"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            4.1.3 Nación/Pueblo Indígena (Opcional)
                        </label>
                        <select
                            {...register("culturalIdentity")}
                            className="w-full border border-uecg-line bg-white p-2 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
                        >
                            <option value="">Ninguno</option>
                            <option value="AYMARA">Aymara</option>
                            <option value="QUECHUA">Quechua</option>
                            <option value="GUARANI">Guaraní</option>
                            <option value="AFROBOLIVIANO">Afroboliviano</option>
                            <option value="CHIQUITANO">Chiquitano</option>
                            <option value="OTRO">Otro Pueblo Originario</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4.2 SALUD */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-4">
                <span className="label-swiss !mb-4 !text-[10px] border-b border-uecg-line pb-2 block">
                    4.2 Salud de la o el Estudiante
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                {...register("nearestHealthCenter")}
                                id="nearestHealthCenter"
                                className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                            />
                            <label
                                htmlFor="nearestHealthCenter"
                                className="text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                            >
                                4.2.1 ¿Existe Posta/Hospital en su comunidad?
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                {...register("healthInsurance")}
                                id="healthInsurance"
                                className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                            />
                            <label
                                htmlFor="healthInsurance"
                                className="text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                            >
                                4.2.4 ¿Tiene seguro de salud?
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-l border-uecg-line pl-6">
                        <label className="label-swiss !mb-0 !text-[10px]">
                            4.2.2 El año pasado acudió a: (Puede marcar varios)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="SUS" {...register("healthCareLocations")} /> 1. SUS
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="VIVIENDA" {...register("healthCareLocations")} /> 5. En su
                                vivienda
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="OTRA_CAJA" {...register("healthCareLocations")} /> 2. Caja
                                de Salud
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="TRADICIONAL" {...register("healthCareLocations")} /> 6.
                                Med. Tradicional
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="PUBLICO" {...register("healthCareLocations")} /> 3.
                                Establec. Público
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="FARMACIA" {...register("healthCareLocations")} /> 7.
                                Farmacia / Automedicación
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="PRIVADO" {...register("healthCareLocations")} /> 4.
                                Privado
                            </label>
                        </div>

                        <label className="label-swiss !mb-0 !text-[10px] mt-3">
                            4.2.3 ¿Cuántas veces fue al Centro de Salud?
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <input type="radio" value="1_A_2" {...register("healthCenterVisits")} /> 1 a 2
                            </label>
                            <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <input type="radio" value="3_A_5" {...register("healthCenterVisits")} /> 3 a 5
                            </label>
                            <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <input type="radio" value="6_MAS" {...register("healthCenterVisits")} /> 6 o más
                            </label>
                            <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <input type="radio" value="NINGUNA" {...register("healthCenterVisits")} /> Ninguna
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4.3 SERVICIOS BÁSICOS */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-4">
                <span className="label-swiss !mb-4 !text-[10px] border-b border-uecg-line pb-2 block">
                    4.3 Acceso a Servicios Básicos (En su vivienda)
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input
                            type="checkbox"
                            {...register("water")}
                            className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                        />{" "}
                        4.3.1 Agua por cañería
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input
                            type="checkbox"
                            {...register("bathroom")}
                            className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                        />{" "}
                        4.3.2 Tiene baño
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input
                            type="checkbox"
                            {...register("sewage")}
                            className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                        />{" "}
                        4.3.3 Alcantarillado
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input
                            type="checkbox"
                            {...register("electricity")}
                            className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                        />{" "}
                        4.3.4 Energía Eléctrica
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <input
                            type="checkbox"
                            {...register("garbage")}
                            className="w-4 h-4 text-uecg-blue border-uecg-line cursor-pointer"
                        />{" "}
                        4.3.5 Recojo de Basura
                    </label>
                </div>

                <div className="border-t border-uecg-line pt-3 flex flex-col md:flex-row gap-4 items-center">
                    <label className="label-swiss !mb-0 !text-[10px] whitespace-nowrap">
                        4.3.6 La vivienda que ocupa es:
                    </label>
                    <select
                        {...register("housingType")}
                        className="w-full md:w-auto border border-uecg-line bg-white p-2 uppercase outline-none text-xs font-bold focus:border-uecg-blue cursor-pointer"
                    >
                        <option value="">Seleccione...</option>
                        <option value="PROPIA">Propia</option>
                        <option value="ALQUILADA">Alquilada</option>
                        <option value="ANTICRETICO">Anticrético</option>
                        <option value="CEDIDA">Cedida por servicios</option>
                        <option value="PRESTADA">Prestada por parientes/amigos</option>
                        <option value="MIXTO">Contrato Mixto</option>
                    </select>
                </div>
            </div>

            {/* 4.4 INTERNET */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-4">
                <span className="label-swiss !mb-4 !text-[10px] border-b border-uecg-line pb-2 block">
                    4.4 Acceso a Internet
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-swiss !mb-2 !text-[10px]">
                            4.4.1 Accede a internet en: (Puede marcar varios)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="VIVIENDA" {...register("internetAccess")} /> Su vivienda
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="UNIDAD_EDUCATIVA" {...register("internetAccess")} /> La
                                Unidad Educativa
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="LUGARES_PUBLICOS" {...register("internetAccess")} />{" "}
                                Lugares Públicos
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="checkbox" value="CELULAR" {...register("internetAccess")} /> Teléfono
                                Celular
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase text-red-600">
                                <input type="checkbox" value="NO_ACCEDE" {...register("internetAccess")} /> No accede a
                                internet
                            </label>
                        </div>
                    </div>
                    <div className="border-l border-uecg-line pl-6">
                        <label className="label-swiss !mb-2 !text-[10px]">4.4.2 Frecuencia de uso:</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="radio" value="DIARIAMENTE" {...register("internetFrequency")} />{" "}
                                Diariamente
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="radio" value="UNA_VEZ_SEMANA" {...register("internetFrequency")} /> Una vez
                                a la semana
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="radio" value="MAS_UNA_VEZ_SEMANA" {...register("internetFrequency")} /> Más
                                de una vez a la semana
                            </label>
                            <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                <input type="radio" value="UNA_VEZ_MES" {...register("internetFrequency")} /> Una vez al
                                mes
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4.5 ACTIVIDAD LABORAL */}
            <div className="border border-uecg-line p-5 bg-gray-50 mb-4">
                <span className="label-swiss !mb-4 !text-[10px] border-b border-uecg-line pb-2 block">
                    4.5 Actividad Laboral de la o el Estudiante
                </span>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="label-swiss !mb-2 !text-[10px]">
                            4.5.1 En la pasada gestión ¿El estudiante trabajó?
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                <input type="radio" value="NO" {...register("didWork")} /> No
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                <input type="radio" value="SI" {...register("didWork")} /> Sí
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                <input type="radio" value="NS_NR" {...register("didWork")} /> Ns/Nr
                            </label>
                        </div>
                    </div>

                    {watch("didWork") === "SI" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 pt-4 border-t border-uecg-line animate-in slide-in-from-top-2">
                            {/* Meses trabajados */}
                            <div>
                                <label className="label-swiss !mb-2 !text-[10px]">Meses que trabajó:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        "Ene",
                                        "Feb",
                                        "Mar",
                                        "Abr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Ago",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dic",
                                    ].map((mes) => (
                                        <label
                                            key={mes}
                                            className="flex items-center gap-1 text-[9px] font-bold uppercase"
                                        >
                                            <input
                                                type="checkbox"
                                                value={mes.toUpperCase()}
                                                {...register("workedMonths")}
                                            />{" "}
                                            {mes}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actividad */}
                            <div>
                                <label className="label-swiss !mb-2 !text-[10px]">4.5.2 ¿En qué actividad?</label>
                                <div className="flex flex-col gap-1.5">
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="AGRICULTURA" {...register("workType")} /> Agricultura
                                        / Ganadería
                                    </label>
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="COMERCIO" {...register("workType")} /> Vendedor /
                                        Comercio
                                    </label>
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="CONSTRUCCION" {...register("workType")} />{" "}
                                        Construcción
                                    </label>
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="HOGAR" {...register("workType")} /> Trabajador del
                                        hogar / Niñero
                                    </label>
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="TRANSPORTE" {...register("workType")} /> Transporte /
                                        Mecánica
                                    </label>
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                        <input type="radio" value="OTRO" {...register("workType")} /> Otro trabajo
                                    </label>
                                </div>
                                {errors.workType && (
                                    <p className="text-[9px] font-bold text-red-500 uppercase mt-1">
                                        {errors.workType.message}
                                    </p>
                                )}
                            </div>

                            {/* Turno, Frecuencia y Pago */}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="label-swiss !mb-1 !text-[10px]">4.5.3 Turnos:</label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                            <input type="checkbox" value="MANANA" {...register("workShift")} /> Mañana
                                        </label>
                                        <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                            <input type="checkbox" value="TARDE" {...register("workShift")} /> Tarde
                                        </label>
                                        <label className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                            <input type="checkbox" value="NOCHE" {...register("workShift")} /> Noche
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="label-swiss !mb-1 !text-[10px]">4.5.4 Frecuencia:</label>
                                    <select
                                        {...register("workFrequency")}
                                        className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none cursor-pointer"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="TODOS_DIAS">Todos los días</option>
                                        <option value="FINES_SEMANA">Fines de semana</option>
                                        <option value="DIAS_HABILES">Días hábiles</option>
                                        <option value="VACACIONES">En Vacaciones</option>
                                        <option value="EVENTUAL">Eventual / Esporádico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-swiss !mb-1 !text-[10px]">4.5.5 ¿Recibió pago?</label>
                                    <select
                                        {...register("gotPaid")}
                                        className="w-full border border-uecg-line p-2 text-xs font-bold uppercase outline-none cursor-pointer"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="DINERO">Sí, en Dinero</option>
                                        <option value="ESPECIE">Sí, en Especie</option>
                                        <option value="NO">No recibió pago</option>
                                        <option value="NS_NR">Ns/Nr</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 4.6 TRANSPORTE Y 4.7 ABANDONO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                {/* Transporte */}
                <div className="border border-uecg-line p-5 bg-gray-50 flex flex-col gap-4">
                    <span className="label-swiss !mb-0 !text-[10px] border-b border-uecg-line pb-2">
                        4.6 Medio de Transporte para llegar a la U.E.
                    </span>
                    <div>
                        <label className="label-swiss !mb-2 !text-[10px]">
                            4.6.1 Generalmente, ¿Cómo llega? <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("transportType")}
                            className={`w-full border p-2 text-xs font-bold uppercase outline-none cursor-pointer ${errors.transportType ? "border-red-500 bg-red-50" : "border-uecg-line focus:border-uecg-blue"}`}
                        >
                            <option value="">Seleccione...</option>
                            <option value="A_PIE">A pie</option>
                            <option value="VEHICULO">En vehículo de transporte terrestre</option>
                            <option value="FLUVIAL">Fluvial</option>
                            <option value="OTRO">Otro</option>
                        </select>
                        {errors.transportType && (
                            <p className="text-[9px] font-bold text-red-500 uppercase">
                                {errors.transportType.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="label-swiss !mb-2 !text-[10px]">
                            4.6.2 ¿Cuál es el tiempo máximo que demora? <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("transportTime")}
                            className={`w-full border p-2 text-xs font-bold uppercase outline-none cursor-pointer ${errors.transportTime ? "border-red-500 bg-red-50" : "border-uecg-line focus:border-uecg-blue"}`}
                        >
                            <option value="">Seleccione...</option>
                            <option value="MENOS_MEDIA_HORA">Menos de media hora</option>
                            <option value="MEDIA_A_UNA_HORA">Entre media hora y una hora</option>
                            <option value="UNA_A_DOS_HORAS">Entre una a dos horas</option>
                            <option value="MAS_DOS_HORAS">Más de dos horas</option>
                        </select>
                        {errors.transportTime && (
                            <p className="text-[9px] font-bold text-red-500 uppercase">
                                {errors.transportTime.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Abandono */}
                <div className="border border-uecg-line p-5 bg-gray-50 flex flex-col gap-4">
                    <span className="label-swiss !mb-0 !text-[10px] border-b border-uecg-line pb-2">
                        4.7 Abandono Escolar en la Gestión Anterior
                    </span>

                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            {...register("abandonedLastYear")}
                            id="abandonedLastYear"
                            className="w-5 h-5 text-uecg-blue border-uecg-line cursor-pointer"
                        />
                        <label
                            htmlFor="abandonedLastYear"
                            className="text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                        >
                            4.7.1 ¿El estudiante abandonó la Unidad Educativa el año pasado?
                        </label>
                    </div>

                    {watch("abandonedLastYear") && (
                        <div className="mt-2 pt-4 border-t border-uecg-line animate-in slide-in-from-top-2">
                            <label className="label-swiss !mb-2 !text-[10px]">
                                4.7.2 Razones de abandono (Puede marcar varias):
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="TRABAJO" {...register("abandonReasons")} /> Trabajo /
                                    Ayuda a padres
                                </label>
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="SALUD" {...register("abandonReasons")} /> Enfermedad /
                                    Accidente
                                </label>
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="DINERO" {...register("abandonReasons")} /> Falta de
                                    dinero
                                </label>
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="VIAJE" {...register("abandonReasons")} /> Viaje o
                                    traslado
                                </label>
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="EMBARAZO" {...register("abandonReasons")} /> Embarazo
                                    / Paternidad
                                </label>
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase">
                                    <input type="checkbox" value="OTRA" {...register("abandonReasons")} /> Otra razón
                                </label>
                            </div>
                            {errors.abandonReasons && (
                                <p className="text-[9px] font-bold text-red-500 uppercase mt-1">
                                    {errors.abandonReasons.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
