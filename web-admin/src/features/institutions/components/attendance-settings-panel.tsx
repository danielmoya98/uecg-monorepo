import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Loader2, Save, ScanFace, Fingerprint, BellRing, ClipboardCheck } from 'lucide-react';
import {
  attendanceSettingsSchema,
  type AttendanceSettingsFormValues,
} from '../schemas/institutions.schema';
import type { AttendanceSettingsPayload } from '../types/institutions.types';
import SwissSelect from './swiss-select';

interface AttendanceSettingsPanelProps {
  initialData: AttendanceSettingsPayload | null;
  isSubmitting: boolean;
  onSubmit: (data: AttendanceSettingsPayload) => void;
}

export default function AttendanceSettingsPanel({
  initialData,
  isSubmitting,
  onSubmit,
}: AttendanceSettingsPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AttendanceSettingsFormValues>({
    resolver: zodResolver(attendanceSettingsSchema) as Resolver<AttendanceSettingsFormValues>,
    defaultValues: {
      enableQrAttendance: false,
      enableBiometricAttendance: false,
      lateToleranceMinutes: 5,
      absentToleranceMinutes: 15,
      notificationFrequency: 'ALERTS_ONLY',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const qrEnabled = watch('enableQrAttendance');
  const bioEnabled = watch('enableBiometricAttendance');
  const notifFreq = watch('notificationFrequency');

  const handleFormSubmit = (data: AttendanceSettingsFormValues) => {
    onSubmit(data);
  };

  return (
    <section className="bg-white border border-uecg-line shadow-sm">
      <div className="bg-uecg-dark text-white p-5 flex items-center gap-3 border-b-4 border-blue-500">
        <Clock className="w-5 h-5 text-blue-400" />
        <h2 className="text-[11px] font-black uppercase tracking-widest">
          Motor de Asistencia y Hardware
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 md:p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8 border-b border-uecg-line">
          {/* Toma Manual */}
          <div className="border border-uecg-line bg-gray-50 p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <ClipboardCheck className="w-6 h-6 text-green-600 mb-4" />
            <h3 className="text-xs font-black uppercase text-uecg-dark leading-tight">
              Toma Manual <br />
              <span className="text-[10px] text-uecg-gray">(App / Web)</span>
            </h3>
            <p className="text-[10px] font-bold text-uecg-gray uppercase mt-3 mb-5 leading-relaxed flex-1">
              El regente marca la lista tocando nombres en pantalla.
            </p>
            <span className="text-[9px] font-black text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 uppercase tracking-widest self-start">
              Activo por defecto
            </span>
          </div>

          {/* Estación de Escáner */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setValue('enableQrAttendance', !qrEnabled, { shouldDirty: true })}
            className={`border p-6 flex flex-col text-left transition-colors relative outline-none cursor-pointer disabled:opacity-50 ${
              qrEnabled ? 'border-uecg-blue bg-blue-50/20 shadow-sm' : 'border-uecg-line hover:border-gray-400'
            }`}
          >
            <ScanFace className={`w-6 h-6 mb-4 ${qrEnabled ? 'text-uecg-blue' : 'text-gray-400'}`} />
            <h3 className={`text-xs font-black uppercase leading-tight ${qrEnabled ? 'text-uecg-blue' : 'text-uecg-dark'}`}>
              Estación de Escáner <br />
              <span className={`text-[10px] ${qrEnabled ? 'text-blue-400' : 'text-uecg-gray'}`}>
                (QR Digital)
              </span>
            </h3>
            <p className="text-[10px] font-bold text-uecg-gray uppercase mt-3 mb-5 leading-relaxed flex-1">
              Escaneo de carnets estudiantiles en puerta.
            </p>
          </button>

          {/* Reloj Biométrico */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setValue('enableBiometricAttendance', !bioEnabled, { shouldDirty: true })}
            className={`border p-6 flex flex-col text-left transition-colors relative outline-none cursor-pointer disabled:opacity-50 ${
              bioEnabled ? 'border-uecg-blue bg-blue-50/20 shadow-sm' : 'border-uecg-line hover:border-gray-400'
            }`}
          >
            <Fingerprint className={`w-6 h-6 mb-4 ${bioEnabled ? 'text-uecg-blue' : 'text-gray-400'}`} />
            <h3 className={`text-xs font-black uppercase leading-tight ${bioEnabled ? 'text-uecg-blue' : 'text-uecg-dark'}`}>
              Reloj Biométrico <br />
              <span className={`text-[10px] ${bioEnabled ? 'text-blue-400' : 'text-uecg-gray'}`}>
                (ZKTeco)
              </span>
            </h3>
            <p className="text-[10px] font-bold text-uecg-gray uppercase mt-3 mb-5 leading-relaxed flex-1">
              Conecta hardware físico de la puerta al servidor.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-uecg-dark border-b border-uecg-line pb-2 block">
              Tolerancias de Horario
            </span>

            {/* Margen de Atraso */}
            <div className="flex flex-col gap-1">
              <label htmlFor="lateToleranceMinutes" className="flex items-center justify-between border border-uecg-line p-4 bg-gray-50 shadow-inner cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
                  Margen de Atraso
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="lateToleranceMinutes"
                    type="number"
                    min="0"
                    {...register('lateToleranceMinutes')}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.lateToleranceMinutes}
                    className="w-16 text-center text-sm font-black p-2 border border-gray-300 outline-none focus:border-yellow-500 text-yellow-600 bg-white disabled:opacity-50"
                  />
                  <span className="text-[9px] font-bold uppercase text-gray-400">Min.</span>
                </div>
              </label>
              {errors.lateToleranceMinutes && (
                <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                  {errors.lateToleranceMinutes.message}
                </p>
              )}
            </div>

            {/* Límite para Falta */}
            <div className="flex flex-col gap-1">
              <label htmlFor="absentToleranceMinutes" className="flex items-center justify-between border border-uecg-line p-4 bg-gray-50 shadow-inner cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
                  Límite para Falta
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="absentToleranceMinutes"
                    type="number"
                    min="0"
                    {...register('absentToleranceMinutes')}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.absentToleranceMinutes}
                    className="w-16 text-center text-sm font-black p-2 border border-gray-300 outline-none focus:border-red-500 text-red-600 bg-white disabled:opacity-50"
                  />
                  <span className="text-[9px] font-bold uppercase text-gray-400">Min.</span>
                </div>
              </label>
              {errors.absentToleranceMinutes && (
                <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                  {errors.absentToleranceMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="notificationFrequency" className="text-[11px] font-black uppercase tracking-widest text-uecg-dark border-b border-uecg-line pb-2 flex items-center gap-2 block">
              <BellRing className="w-3.5 h-3.5 text-uecg-blue" /> Nivel de Intrusión (Push)
            </label>
            <SwissSelect
              id="notificationFrequency"
              value={notifFreq}
              onChange={(v) => setValue('notificationFrequency', v, { shouldValidate: true })}
              options={[
                { value: 'ALERTS_ONLY', label: 'SOLO ALERTAS CRÍTICAS' },
                { value: 'ENTRY_EXIT', label: 'INGRESO Y SALIDA' },
                { value: 'PER_CLASS', label: 'EXTREMO (CADA CLASE)' },
              ]}
              placeholder="-- CONFIGURACIÓN --"
              disabled={isSubmitting}
              hasError={!!errors.notificationFrequency}
            />
            {errors.notificationFrequency && (
              <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                {errors.notificationFrequency.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-uecg-line flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-black transition-colors flex items-center justify-center gap-3 shadow-sm outline-none w-full md:w-auto cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Reglas de Asistencia
          </button>
        </div>
      </form>
    </section>
  );
}
