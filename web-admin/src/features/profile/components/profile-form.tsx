import { useEffect } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schema";
import type { UserProfile, UpdateProfilePayload } from "../api/profile.service";

interface ProfileFormProps {
  profileData: UserProfile;
  isSubmitting: boolean;
  onSubmit: (data: UpdateProfilePayload) => void;
}

export default function ProfileForm({
  profileData,
  isSubmitting,
  onSubmit,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profileData?.fullName || "",
      ci: profileData?.ci || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      specialty: profileData?.specialty || "",
    },
  });

  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.fullName,
        ci: profileData.ci || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        specialty: profileData.specialty || "",
      });
    }
  }, [profileData, reset]);

  return (
    <section className="bg-white border border-uecg-line p-6 shadow-sm">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-3 mb-5 flex items-center gap-2">
        <User className="w-3.5 h-3.5" aria-hidden="true" /> Ficha Personal
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* IDENTIDAD DEL SISTEMA (Solo Lectura) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 border border-uecg-line border-dashed">
          <div>
            <label className="label-swiss !mb-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3" aria-hidden="true" /> Correo Institucional
            </label>
            <input
              type="text"
              value={profileData.email || ""}
              disabled
              className="w-full bg-transparent border-none p-0 text-uecg-gray focus:outline-none text-xs font-bold cursor-not-allowed"
              aria-label="Correo Institucional (Solo lectura)"
            />
          </div>
          <div>
            <label className="label-swiss !mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Nivel de Acceso (Rol)
            </label>
            <input
              type="text"
              value={profileData.role || ""}
              disabled
              className="w-full bg-transparent border-none p-0 text-uecg-gray focus:outline-none text-xs font-bold uppercase tracking-widest cursor-not-allowed"
              aria-label="Nivel de Acceso (Solo lectura)"
            />
          </div>
        </div>

        {/* CAMPOS EDITABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="label-swiss !mb-1">
              Nombre Completo
            </label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase transition-colors ${
                errors.fullName
                  ? "border-red-500"
                  : "border-uecg-line focus:border-uecg-blue"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.fullName}
              aria-describedby={
                errors.fullName ? "fullName-error" : undefined
              }
            />
            {errors.fullName && (
              <p
                id="fullName-error"
                className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ci"
              className="label-swiss !mb-1 flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3" aria-hidden="true" /> C.I. / Documento
            </label>
            <input
              id="ci"
              type="text"
              {...register("ci")}
              placeholder="Ej. 1234567"
              className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase tracking-widest transition-colors ${
                errors.ci
                  ? "border-red-500"
                  : "border-uecg-line focus:border-uecg-blue"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.ci}
              aria-describedby={errors.ci ? "ci-error" : undefined}
            />
            {errors.ci && (
              <p
                id="ci-error"
                className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500"
              >
                {errors.ci.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="label-swiss !mb-1 flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3" aria-hidden="true" /> Teléfono Celular
            </label>
            <input
              id="phone"
              type="text"
              {...register("phone")}
              placeholder="Ej. 70012345"
              className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase tracking-widest transition-colors ${
                errors.phone
                  ? "border-red-500"
                  : "border-uecg-line focus:border-uecg-blue"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500"
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="label-swiss !mb-1 flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3" aria-hidden="true" /> Dirección de Domicilio
            </label>
            <input
              id="address"
              type="text"
              {...register("address")}
              placeholder="Calle, Número, Zona..."
              className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase transition-colors ${
                errors.address
                  ? "border-red-500"
                  : "border-uecg-line focus:border-uecg-blue"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            {errors.address && (
              <p
                id="address-error"
                className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500"
              >
                {errors.address.message}
              </p>
            )}
          </div>

          {profileData.role === "DOCENTE" && (
            <div className="md:col-span-2">
              <label
                htmlFor="specialty"
                className="label-swiss !mb-1 flex items-center gap-1.5"
              >
                <GraduationCap className="w-3 h-3" aria-hidden="true" /> Especialidad / Área
              </label>
              <input
                id="specialty"
                type="text"
                {...register("specialty")}
                placeholder="Ej. Ciencias Exactas, Lenguaje..."
                className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase transition-colors ${
                  errors.specialty
                    ? "border-red-500"
                    : "border-uecg-line focus:border-uecg-blue"
                }`}
                disabled={isSubmitting}
                aria-invalid={!!errors.specialty}
                aria-describedby={
                  errors.specialty ? "specialty-error" : undefined
                }
              />
              {errors.specialty && (
                <p
                  id="specialty-error"
                  className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500"
                >
                  {errors.specialty.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-uecg-line mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 font-black uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" aria-hidden="true" /> Actualizar Ficha
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
