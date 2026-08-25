import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  HeartPulse,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PublicUpdatesService } from "../api/public-updates.service";

export function PublicRudeFormPage() {
  const { token } = useParams({ strict: false }) as { token: string };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    names: "",
    lastNamePaterno: "",
    lastNameMaterno: "",
    ci: "",
    complement: "",
    expedition: "",
    birthDate: "",
    gender: "M",
    birthCountry: "BOLIVIA",
    birthDepartment: "",
    birthProvince: "",
    birthLocality: "",
    documentType: "CI",
    hasDisability: false,
    disabilityType: "",
    hasAutism: false,
    hasExtraordinaryTalent: false,
    department: "COCHABAMBA",
    province: "",
    municipality: "",
    locality: "",
    zone: "",
    street: "",
    houseNumber: "",
    phone: "",
    cellphone: "",
    nativeLanguage: "CASTELLANO",
    frequentLanguages: "CASTELLANO",
    culturalIdentity: "MESTIZO",
    nearestHealthCenter: "SI",
    healthInsurance: "SUS",
    water: "RED_PUBLICA",
    electricity: "SI",
    sewage: "ALCANTARILLADO",
    bathroom: "USO_EXCLUSIVO",
    housingType: "PROPIA",
    guardians: [],
  });

  const { data: verifyData, isLoading, isError, error } = useQuery({
    queryKey: ["public_rude_verify", token],
    queryFn: () => PublicUpdatesService.verifyToken(token),
    retry: 1,
    enabled: !!token,
  });

  useEffect(() => {
    if (verifyData?.data) {
      const { student, rudeRecord, guardians } = verifyData.data;
      setFormData((prev: any) => ({
        ...prev,
        names: student?.names || "",
        lastNamePaterno: student?.lastNamePaterno || "",
        lastNameMaterno: student?.lastNameMaterno || "",
        ci: student?.ci || "",
        birthDate: student?.birthDate ? student.birthDate.split("T")[0] : "",
        gender: student?.gender || "M",
        birthCountry: student?.birthCountry || "BOLIVIA",
        birthDepartment: student?.birthDepartment || "",
        birthProvince: student?.birthProvince || "",
        birthLocality: student?.birthLocality || "",
        hasDisability: student?.hasDisability || false,
        disabilityType: student?.disabilityType || "",
        hasAutism: student?.hasAutism || false,
        hasExtraordinaryTalent: student?.hasExtraordinaryTalent || false,
        department: rudeRecord?.department || "COCHABAMBA",
        province: rudeRecord?.province || "",
        municipality: rudeRecord?.municipality || "",
        locality: rudeRecord?.locality || "",
        zone: rudeRecord?.zone || "",
        street: rudeRecord?.street || "",
        houseNumber: rudeRecord?.houseNumber || "",
        phone: rudeRecord?.phone || "",
        cellphone: rudeRecord?.cellphone || "",
        nativeLanguage: rudeRecord?.nativeLanguage || "CASTELLANO",
        culturalIdentity: rudeRecord?.culturalIdentity || "MESTIZO",
        water: rudeRecord?.water || "RED_PUBLICA",
        electricity: rudeRecord?.electricity || "SI",
        sewage: rudeRecord?.sewage || "ALCANTARILLADO",
        housingType: rudeRecord?.housingType || "PROPIA",
        guardians: guardians && guardians.length > 0 ? guardians : [
          {
            names: "",
            lastNamePaterno: "",
            lastNameMaterno: "",
            ci: "",
            relationship: "PADRE",
            phone: "",
            occupation: "",
            educationLevel: "SECUNDARIA",
          }
        ],
      }));
    }
  }, [verifyData]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => PublicUpdatesService.submitUpdate(token, data),
    onSuccess: () => {
      toast.success("Formulario enviado a revisión exitosamente.");
      setStep(5); // Pantalla de éxito
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error al enviar la actualización.");
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleGuardianChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = [...prev.guardians];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, guardians: updated };
    });
  };

  const addGuardian = () => {
    setFormData((prev: any) => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          names: "",
          lastNamePaterno: "",
          lastNameMaterno: "",
          ci: "",
          relationship: "MADRE",
          phone: "",
          occupation: "",
          educationLevel: "SECUNDARIA",
        },
      ],
    }));
  };

  const removeGuardian = (index: number) => {
    if (formData.guardians.length <= 1) return;
    setFormData((prev: any) => ({
      ...prev,
      guardians: prev.guardians.filter((_: any, i: number) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-uecg-blue mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-uecg-dark">
          Verificando enlace oficial RUDE...
        </p>
      </div>
    );
  }

  if (isError) {
    const errorMsg = (error as any)?.response?.data?.message || "El enlace no es válido o ha expirado.";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-red-200 p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-red-700 mb-2">
            Enlace Inválido o Expirado
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            {errorMsg}
          </p>
          <div className="text-[11px] font-bold text-slate-500 bg-slate-100 p-3 uppercase tracking-wider">
            Unidad Educativa Colegio Che Guevara
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6">
      {/* Header Institucional */}
      <header className="w-full max-w-3xl mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-uecg-blue/10 border border-uecg-blue/20 text-uecg-blue text-[10px] font-black uppercase tracking-widest mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Portal Oficial RUDE — Ministerio de Educación
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-uecg-dark">
          Actualización de Datos Estudiantiles
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
          Estudiante: <span className="text-uecg-blue font-bold">{verifyData?.data?.student?.names} {verifyData?.data?.student?.lastNamePaterno}</span> • Código RUDE: {verifyData?.data?.rudeCode || "S/R"}
        </p>
      </header>

      {/* Tarjeta Principal del Formulario */}
      <div className="w-full max-w-3xl bg-white border border-uecg-line shadow-sm">
        {/* Stepper Superior */}
        {step < 5 && (
          <nav className="grid grid-cols-4 border-b border-uecg-line text-[10px] font-bold tracking-widest uppercase">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3.5 flex items-center justify-center gap-2 border-r border-uecg-line transition-colors ${
                step === 1 ? "bg-uecg-blue text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4 hidden sm:block" /> 1. Identidad
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`p-3.5 flex items-center justify-center gap-2 border-r border-uecg-line transition-colors ${
                step === 2 ? "bg-uecg-blue text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4 hidden sm:block" /> 2. Domicilio
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`p-3.5 flex items-center justify-center gap-2 border-r border-uecg-line transition-colors ${
                step === 3 ? "bg-uecg-blue text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <HeartPulse className="w-4 h-4 hidden sm:block" /> 3. Servicios
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className={`p-3.5 flex items-center justify-center gap-2 transition-colors ${
                step === 4 ? "bg-uecg-blue text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4 hidden sm:block" /> 4. Tutores
            </button>
          </nav>
        )}

        {/* Contenido Dinámico por Paso */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-uecg-blue">
                    Paso 1: Información de Identidad y Nacimiento
                  </h3>
                  <p className="text-[11px] text-slate-500">Verifique los datos conforme al Certificado de Nacimiento y C.I.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Nombres *</label>
                    <input
                      type="text"
                      value={formData.names}
                      onChange={(e) => handleChange("names", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Apellido Paterno *</label>
                    <input
                      type="text"
                      value={formData.lastNamePaterno}
                      onChange={(e) => handleChange("lastNamePaterno", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Apellido Materno</label>
                    <input
                      type="text"
                      value={formData.lastNameMaterno}
                      onChange={(e) => handleChange("lastNameMaterno", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Cédula de Identidad (C.I.) *</label>
                    <input
                      type="text"
                      value={formData.ci}
                      onChange={(e) => handleChange("ci", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => handleChange("complement", e.target.value.toUpperCase())}
                      placeholder="Ej. 1A"
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Género</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none bg-white"
                    >
                      <option value="M">MASCULINO</option>
                      <option value="F">FEMENINO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Departamento de Nacimiento</label>
                    <input
                      type="text"
                      value={formData.birthDepartment}
                      onChange={(e) => handleChange("birthDepartment", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-uecg-blue">
                    Paso 2: Dirección y Domicilio Actual
                  </h3>
                  <p className="text-[11px] text-slate-500">Registre la ubicación actual donde reside el estudiante.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Departamento</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Provincia</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => handleChange("province", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Municipio</label>
                    <input
                      type="text"
                      value={formData.municipality}
                      onChange={(e) => handleChange("municipality", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Zona / Barrio</label>
                    <input
                      type="text"
                      value={formData.zone}
                      onChange={(e) => handleChange("zone", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Avenida / Calle</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleChange("street", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">N° de Casa / Edificio</label>
                    <input
                      type="text"
                      value={formData.houseNumber}
                      onChange={(e) => handleChange("houseNumber", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Celular de Contacto</label>
                    <input
                      type="text"
                      value={formData.cellphone}
                      onChange={(e) => handleChange("cellphone", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Teléfono Fijo</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-uecg-blue">
                    Paso 3: Idioma, Salud y Servicios Básicos
                  </h3>
                  <p className="text-[11px] text-slate-500">Información sociocultural y acceso a servicios según normativa SIE.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Idioma Materno</label>
                    <input
                      type="text"
                      value={formData.nativeLanguage}
                      onChange={(e) => handleChange("nativeLanguage", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Identidad Cultural</label>
                    <input
                      type="text"
                      value={formData.culturalIdentity}
                      onChange={(e) => handleChange("culturalIdentity", e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Agua Potable</label>
                    <select
                      value={formData.water}
                      onChange={(e) => handleChange("water", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none bg-white"
                    >
                      <option value="RED_PUBLICA">RED PÚBLICA</option>
                      <option value="POZO">POZO</option>
                      <option value="CISTERNA">CARRO CISTERNA</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Energía Eléctrica</label>
                    <select
                      value={formData.electricity}
                      onChange={(e) => handleChange("electricity", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none bg-white"
                    >
                      <option value="SI">SÍ TIENE</option>
                      <option value="NO">NO TIENE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-1">Alcantarillado</label>
                    <select
                      value={formData.sewage}
                      onChange={(e) => handleChange("sewage", e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 focus:border-uecg-blue focus:outline-none bg-white"
                    >
                      <option value="ALCANTARILLADO">RED DE ALCANTARILLADO</option>
                      <option value="POZO_CIEGO">POZO CIEGO</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-uecg-blue">
                        Paso 4: Datos de los Padres / Tutores Legales
                      </h3>
                      <p className="text-[11px] text-slate-500">Mínimo 1 tutor registrado con número de contacto activo.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addGuardian}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-uecg-dark text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      + Añadir Tutor
                    </button>
                  </div>
                </div>

                {formData.guardians.map((guardian: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 relative space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                        Tutor #{idx + 1}
                      </span>
                      {formData.guardians.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuardian(idx)}
                          className="text-[10px] font-bold text-red-600 hover:underline uppercase"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">Parentesco *</label>
                        <select
                          value={guardian.relationship}
                          onChange={(e) => handleGuardianChange(idx, "relationship", e.target.value)}
                          className="w-full text-xs font-bold p-2 border border-slate-300 bg-white"
                        >
                          <option value="PADRE">PADRE</option>
                          <option value="MADRE">MADRE</option>
                          <option value="TUTOR">TUTOR LEGAL</option>
                          <option value="ABUELO">ABUELO/A</option>
                          <option value="HERMANO">HERMANO/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">Nombres *</label>
                        <input
                          type="text"
                          value={guardian.names}
                          onChange={(e) => handleGuardianChange(idx, "names", e.target.value.toUpperCase())}
                          className="w-full text-xs font-bold uppercase p-2 border border-slate-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">Apellido Paterno *</label>
                        <input
                          type="text"
                          value={guardian.lastNamePaterno}
                          onChange={(e) => handleGuardianChange(idx, "lastNamePaterno", e.target.value.toUpperCase())}
                          className="w-full text-xs font-bold uppercase p-2 border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">C.I. *</label>
                        <input
                          type="text"
                          value={guardian.ci}
                          onChange={(e) => handleGuardianChange(idx, "ci", e.target.value)}
                          className="w-full text-xs font-bold p-2 border border-slate-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">Celular *</label>
                        <input
                          type="text"
                          value={guardian.phone}
                          onChange={(e) => handleGuardianChange(idx, "phone", e.target.value)}
                          className="w-full text-xs font-bold p-2 border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5">Ocupación</label>
                        <input
                          type="text"
                          value={guardian.occupation}
                          onChange={(e) => handleGuardianChange(idx, "occupation", e.target.value.toUpperCase())}
                          className="w-full text-xs font-bold uppercase p-2 border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-uecg-dark">
                  ¡Actualización Enviada a Secretaría!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Los datos del estudiante han sido remitidos al sistema de control de la Unidad Educativa Colegio Che Guevara. Secretaría revisará y validará la información para la consolidación oficial del RUDE.
                </p>
                <div className="pt-4">
                  <span className="inline-block bg-slate-100 text-slate-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                    Puede cerrar esta ventana
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de Navegación */}
          {step < 5 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Anterior
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-uecg-blue hover:bg-blue-700 transition-colors"
                >
                  Siguiente <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={() => submitMutation.mutate(formData)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Enviar Formulario a Revisión
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
