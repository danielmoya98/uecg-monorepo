import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: "success", title: "Sincronización SIE Exitosa", time: "Hace 5 min", icon: CheckCircle2 },
    { id: 2, type: "warning", title: "Docente sin carga horaria", time: "Hace 1 hora", icon: AlertTriangle },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-9 h-9 flex items-center justify-center border transition-all relative cursor-pointer outline-none ${isOpen ? "bg-blue-50 border-uecg-blue text-uecg-blue shadow-inner" : "bg-white border-uecg-line text-uecg-gray hover:border-gray-400 hover:text-uecg-dark shadow-sm"}`}>
        <Bell className="w-4 h-4" strokeWidth={2} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-none" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-80 border border-uecg-line bg-white shadow-2xl z-50 flex flex-col transition-all duration-200">
          <div className="flex justify-between items-center p-4 border-b border-uecg-line bg-gray-50">
            <p className="text-[9px] uppercase tracking-widest text-uecg-gray font-black flex items-center gap-2"><Bell className="w-3 h-3" /> Notificaciones del Sistema</p>
          </div>
          <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className="flex items-start gap-4 p-4 border-b border-uecg-line hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${notif.type === "success" ? "bg-green-50 text-green-600 border-green-200 group-hover:bg-green-600 group-hover:text-white" : "bg-yellow-50 text-yellow-600 border-yellow-200 group-hover:bg-yellow-500 group-hover:text-white"} transition-colors`}><Icon className="w-4 h-4" strokeWidth={2} /></div>
                  <div className="flex flex-col justify-center"><p className="text-[10px] font-black text-uecg-text uppercase tracking-widest leading-tight">{notif.title}</p><p className="text-[9px] text-uecg-gray font-bold uppercase tracking-widest mt-1">{notif.time}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
