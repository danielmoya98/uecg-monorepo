import { Lock, Key } from "lucide-react";

interface SecurityPanelProps {
  onOpenChangePasswordDrawer: () => void;
}

export default function SecurityPanel({ onOpenChangePasswordDrawer }: SecurityPanelProps) {
  return (
    <section className="bg-white border border-uecg-line p-6 shadow-sm h-full">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-3 mb-5 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5" /> Seguridad de Acceso
      </h2>

      <div className="flex flex-col items-center text-center gap-3 bg-gray-50 border border-uecg-line p-6 mt-4">
        <Key className="w-10 h-10 text-uecg-dark" />
        <h3 className="text-sm font-black uppercase tracking-tight text-uecg-text mt-2">
          Credenciales Personales
        </h3>
        <p className="text-[10px] text-uecg-gray font-bold uppercase tracking-widest leading-relaxed">
          Puede cambiar su contraseña en cualquier momento. Deberá proporcionar su contraseña actual para
          autorizar el cambio.
        </p>

        <button
          onClick={onOpenChangePasswordDrawer}
          className="w-full mt-4 py-3 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-uecg-blue transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" /> Modificar Contraseña
        </button>
      </div>
    </section>
  );
}
