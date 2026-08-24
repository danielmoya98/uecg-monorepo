import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
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
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Focus lock and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isSubmitting) {
          reset();
          onClose();
        }
      }
      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousFocus = document.activeElement as HTMLElement;

    setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector(
        "button:not([disabled]), input:not([disabled])"
      ) as HTMLElement;
      firstInput?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose, isSubmitting, reset]);

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="fixed inset-0 z-[9999] flex justify-end"
        >
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={!isSubmitting ? handleClose : undefined}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* Cabecera del Cajón */}
            <div className="flex items-center justify-between border-b p-5 border-uecg-line bg-gray-50 shrink-0">
              <div>
                <span className="label-swiss !mb-0 !text-[9px] text-uecg-blue">
                  Seguridad de Acceso
                </span>
                <h2
                  id="drawer-title"
                  className="text-xl font-black uppercase tracking-tighter text-uecg-text mt-0.5"
                >
                  Cambiar Clave
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 text-uecg-gray hover:text-red-600 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
