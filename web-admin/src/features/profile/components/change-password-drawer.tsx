import { Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DrawerShell } from "@/shared/ui/drawer-shell";
import {
  passwordSchema,
  type PasswordFormValues,
} from "../schemas/profile.schema";
import { useChangePassword } from "../hooks/use-change-password";


interface ChangePasswordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordDrawer({
  isOpen,
  onClose,
}: ChangePasswordDrawerProps) {
  const handleSuccess = () => {
    reset();
    onClose();
  };

  const { changePassword, isSubmitting } = useChangePassword(handleSuccess);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };


  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar Clave"
      kicker="Seguridad de Acceso"
      icon="🔑"
      headerVariant="default"
      isSubmitting={isSubmitting}
      maxWidth="max-w-md"
    >
      {/* Contenido */}
      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
                <div className="bg-blue-50 border border-blue-200 p-4 mb-2">
                  <p className="text-[10px] text-uecg-blue font-bold uppercase tracking-widest leading-relaxed">
                    Su nueva contraseña debe ser segura y no debe compartirla
                    con nadie.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="label-swiss !text-[10px] !mb-1.5"
                  >
                    Contraseña Actual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...register("currentPassword")}
                    placeholder="••••••••"
                    className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none font-black tracking-widest transition-colors ${
                      errors.currentPassword
                        ? "border-red-500"
                        : "border-uecg-line focus:border-uecg-blue"
                    }`}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.currentPassword}
                    aria-describedby={
                      errors.currentPassword ? "currentPassword-error" : undefined
                    }
                  />
                  {errors.currentPassword && (
                    <p
                      id="currentPassword-error"
                      className="text-[9px] text-red-500 font-bold uppercase mt-1.5"
                    >
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="label-swiss !text-[10px] !mb-1.5"
                  >
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...register("newPassword")}
                    placeholder="••••••••"
                    className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none font-black tracking-widest transition-colors ${
                      errors.newPassword
                        ? "border-red-500"
                        : "border-uecg-line focus:border-uecg-blue"
                    }`}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.newPassword}
                    aria-describedby={
                      errors.newPassword ? "newPassword-error" : undefined
                    }
                  />
                  {errors.newPassword && (
                    <p
                      id="newPassword-error"
                      className="text-[9px] text-red-500 font-bold uppercase mt-1.5"
                    >
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="label-swiss !text-[10px] !mb-1.5"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none font-black tracking-widest transition-colors ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-uecg-line focus:border-uecg-blue"
                    }`}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                  />
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="text-[9px] text-red-500 font-bold uppercase mt-1.5"
                    >
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full py-3 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-uecg-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" aria-hidden="true" /> Actualizar Contraseña
                    </>
                  )}
                </button>
              </form>
            </div>
    </DrawerShell>
  );
}

