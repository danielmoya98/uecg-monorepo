import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Save, Smartphone, MessageCircle, Mail, Loader2, Power } from 'lucide-react';
import {
  campaignSettingsSchema,
  type CampaignSettingsFormValues,
} from '../schemas/institutions.schema';
import type { CampaignSettingsPayload } from '../types/institutions.types';

interface CampaignSettingsPanelProps {
  initialData: CampaignSettingsPayload | null;
  isSubmitting: boolean;
  onSubmit: (data: CampaignSettingsPayload) => void;
}

export default function CampaignSettingsPanel({
  initialData,
  isSubmitting,
  onSubmit,
}: CampaignSettingsPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignSettingsFormValues>({
    resolver: zodResolver(campaignSettingsSchema) as Resolver<CampaignSettingsFormValues>,
    defaultValues: {
      enableDigitalRudeUpdates: false,
      maxRudeUpdatesPerYear: 2,
      activeNotificationChannels: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const enabled = watch('enableDigitalRudeUpdates');
  const channels = watch('activeNotificationChannels') || [];

  const toggleChannel = (channel: string) => {
    if (isSubmitting) return;
    const newChannels = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel];
    setValue('activeNotificationChannels', newChannels, { shouldValidate: true, shouldDirty: true });
  };

  const handleFormSubmit = (data: CampaignSettingsFormValues) => {
    onSubmit(data);
  };

  return (
    <section className="bg-white border border-uecg-line shadow-sm">
      <div className="bg-uecg-dark text-white p-5 flex items-center gap-3 border-b-4 border-uecg-blue">
        <ShieldCheck className="w-5 h-5 text-uecg-blue" />
        <h2 className="text-[11px] font-black uppercase tracking-widest">
          Motor de Actualización RUDE (App Familias)
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 md:p-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-uecg-line">
          <div className="flex-1">
            <h3 className="text-[11px] font-black uppercase text-uecg-dark mb-1">
              Estado de la Campaña Digital
            </h3>
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              Abre o cierra la "bóveda" de actualizaciones.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setValue('enableDigitalRudeUpdates', !enabled, { shouldDirty: true })}
            className={`w-full md:w-64 h-20 flex items-center justify-center gap-3 shrink-0 transition-colors border shadow-inner outline-none cursor-pointer disabled:opacity-50 ${
              enabled
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Power className={`w-8 h-8 ${enabled ? 'text-white' : 'text-gray-400'}`} strokeWidth={3} />
            <span className="text-sm font-black uppercase tracking-widest">
              {enabled ? 'EN LÍNEA (ACTIVO)' : 'SISTEMA APAGADO'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <label htmlFor="maxRudeUpdatesPerYear" className="text-[11px] font-black uppercase text-uecg-dark border-b border-uecg-line pb-2 mb-2 block">
              Límite Anual por Estudiante
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-uecg-line shadow-inner">
              <input
                id="maxRudeUpdatesPerYear"
                type="number"
                min="1"
                max="5"
                {...register('maxRudeUpdatesPerYear')}
                disabled={isSubmitting}
                aria-invalid={!!errors.maxRudeUpdatesPerYear}
                className="w-20 border border-gray-300 bg-white px-3 py-3 text-center text-sm font-black text-uecg-dark outline-none focus:border-uecg-blue disabled:opacity-50"
              />
              <span className="text-[10px] font-black text-uecg-gray uppercase tracking-widest">
                Envíos Máximos
              </span>
            </div>
            {errors.maxRudeUpdatesPerYear && (
              <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                {errors.maxRudeUpdatesPerYear.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase text-uecg-dark border-b border-uecg-line pb-2 mb-2 block">
              Canales de Difusión Permitidos
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => toggleChannel('PUSH_APP')}
                className={`border p-4 flex flex-col items-center justify-center gap-2 transition-colors outline-none cursor-pointer disabled:opacity-50 ${
                  channels.includes('PUSH_APP')
                    ? 'border-uecg-blue bg-blue-50 text-uecg-blue shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center">
                  App Móvil
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => toggleChannel('EMAIL')}
                className={`border p-4 flex flex-col items-center justify-center gap-2 transition-colors outline-none cursor-pointer disabled:opacity-50 ${
                  channels.includes('EMAIL')
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center">
                  E-Mail
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => toggleChannel('WHATSAPP')}
                className={`border p-4 flex flex-col items-center justify-center gap-2 transition-colors outline-none cursor-pointer disabled:opacity-50 ${
                  channels.includes('WHATSAPP')
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center">
                  WhatsApp
                </span>
              </button>
            </div>
            {errors.activeNotificationChannels && (
              <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                {errors.activeNotificationChannels.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-uecg-line flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-black transition-colors flex items-center justify-center gap-3 shadow-sm outline-none disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Aplicando Cambios...' : 'Guardar Políticas de Campaña'}
          </button>
        </div>
      </form>
    </section>
  );
}
