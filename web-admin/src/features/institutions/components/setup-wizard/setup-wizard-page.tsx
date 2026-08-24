import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  School,
  User,
  Info,
} from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { AuthService } from '@/features/auth/api/auth.service';
import { useTourStore } from '@/features/academic-years/store/use-tour-store';
import { setupWizardSchema, type SetupWizardFormValues } from '../../schemas/setup-wizard.schema';
import SwissSelect from '../swiss-select';

const STEPS = [
  {
    id: 1,
    title: 'Directora / Administrador',
    subtitle: 'Cuenta de acceso suprema',
    icon: ShieldCheck,
    tag: 'Paso 1 de 4',
  },
  {
    id: 2,
    title: 'Ficha RUE del Colegio',
    subtitle: 'Acreditación legal SIE',
    icon: Building2,
    tag: 'Paso 2 de 4',
  },
  {
    id: 3,
    title: 'Operación & Asistencia',
    subtitle: 'Horarios y tolerancias',
    icon: Sliders,
    tag: 'Paso 3 de 4',
  },
  {
    id: 4,
    title: 'Puesta en Marcha',
    subtitle: 'Confirmación y arranque',
    icon: Sparkles,
    tag: 'Paso 4 de 4',
  },
];

export default function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { startTour } = useTourStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SetupWizardFormValues>({
    resolver: zodResolver(setupWizardSchema) as Resolver<SetupWizardFormValues>,
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      ci: '',
      phone: '',
      rueCode: '',
      institutionName: '',
      dependencyType: 'FISCAL',
      department: 'CHUQUISACA',
      municipality: 'Sucre',
      district: 'Sucre 1',
      address: '',
      institutionPhone: '',
      institutionEmail: '',
      foundedYear: '',
      shifts: ['MANANA', 'TARDE'],
      levels: ['PRIMARIA', 'SECUNDARIA'],
      schedulingMode: 'FIXED_BASE',
      enableQrAttendance: true,
      lateToleranceMinutes: 5,
      absentToleranceMinutes: 15,
    },
  });

  const formValues = watch();

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof SetupWizardFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'password', 'ci'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['rueCode', 'institutionName', 'department', 'municipality', 'district', 'address', 'shifts', 'levels'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['schedulingMode', 'lateToleranceMinutes', 'absentToleranceMinutes'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleArrayItem = (field: 'shifts' | 'levels', item: string) => {
    const current = (formValues[field] as string[]) || [];
    const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
    setValue(field, next, { shouldValidate: true });
  };

  const onSubmit = async (data: SetupWizardFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        ci: data.ci?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        institutionPhone: data.institutionPhone?.trim() || undefined,
        institutionEmail: data.institutionEmail?.trim() || undefined,
        foundedYear:
          data.foundedYear !== '' && data.foundedYear !== undefined
            ? Number(data.foundedYear)
            : undefined,
        lateToleranceMinutes: Number(data.lateToleranceMinutes ?? 5),
        absentToleranceMinutes: Number(data.absentToleranceMinutes ?? 15),
      };

      const response = await AuthService.setupInitialDirector(payload);
      if (response?.user) {
        AuthService.saveSessionMetadata(response.user);
      }
      toast.success('¡COLEGIO E INSTITUCIÓN INICIALIZADOS CON ÉXITO!', {
        description: 'Bienvenida a la plataforma. Iniciando el asistente guiado...',
      });
      startTour(0);
      navigate({ to: '/dashboard' as any });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al inicializar el colegio';
      toast.error('ERROR DE INICIALIZACIÓN', {
        description: typeof msg === 'string' ? msg : msg[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000060] via-[#000089] to-[#000045] text-white flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans antialiased relative selection:bg-blue-300 selection:text-uecg-blue">
      {/* Background Decorative Grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* TOP HEADER */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/10 border border-white/30 flex items-center justify-center p-2 shadow-inner backdrop-blur-xs">
            <img
              src={logoSvg}
              alt="Escudo UECG"
              className="w-full h-full object-contain filter invert brightness-200"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-white">
              Unidad Educativa Colegio Che Guevara
            </h1>
            <p className="text-[10px] text-blue-200 tracking-[0.2em] uppercase font-bold">
              Asistente de Primer Arranque &bull; Configuración Inicial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 border border-white/25 px-3 py-1.5 text-blue-100 backdrop-blur-xs">
            Paso {currentStep} de 4
          </span>
        </div>
      </header>

      {/* CENTER CONTAINER */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-6 flex-1 flex flex-col justify-center">
        {/* Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                className={`p-3 border text-left transition-all flex flex-col justify-between gap-2 backdrop-blur-xs cursor-default ${
                  isCurrent
                    ? 'bg-white text-uecg-blue border-white shadow-xl ring-2 ring-blue-300'
                    : isDone
                      ? 'bg-white/20 text-blue-100 border-white/30 cursor-pointer hover:bg-white/30'
                      : 'bg-black/20 text-white/50 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${isCurrent ? 'text-uecg-blue' : 'text-blue-200'}`}>
                    0{s.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-uecg-blue' : isDone ? 'text-emerald-300' : 'text-white/40'}`} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight line-clamp-1">{s.title}</h3>
                  <p className={`text-[9px] line-clamp-1 ${isCurrent ? 'text-gray-600' : 'text-blue-200/80'}`}>
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white text-[#1A1A1A] border border-white/30 shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between"
        >
          {/* STEP 1: Directora */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-200 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" /> Cuenta de Administradora / Directora
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">
                  1. Acreditación de la Cuenta Principal
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ingrese los datos personales y de acceso de la persona titular de la Dirección. Esta cuenta tendrá acceso ilimitado para configurar gestiones, aulas y emitir credenciales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Nombre Completo &bull; Título Profesional <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="Ej. Lic. María Elena Ramos"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Nombre con el que figurará en actas y reportes</span>
                  {errors.fullName && <p className="text-[10px] font-bold text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Cédula de Identidad (CI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('ci')}
                    placeholder="Ej. 1234567 CH"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Número de carnet y expedición</span>
                  {errors.ci && <p className="text-[10px] font-bold text-red-500">{errors.ci.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Correo Electrónico de Ingreso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="directora@uecg.edu.bo"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Servirá para iniciar sesión en la plataforma</span>
                  {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Contraseña Maestra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Recomendamos usar mayúsculas, números y símbolos</span>
                  {errors.password && <p className="text-[10px] font-bold text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Teléfono Celular / WhatsApp de Contacto (Opcional)
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="Ej. 78901234"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Institución */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-200 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <School className="w-3.5 h-3.5" /> Ficha SIE / RUE Ministerial
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">
                  2. Datos Oficiales de la Unidad Educativa
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Especifique el código RUE otorgado por la Dirección Distrital y los niveles académicos habilitados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Código RUE / SIE <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('rueCode')}
                    placeholder="Ej. 80730145"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Código oficial de registro educativo ministerial</span>
                  {errors.rueCode && <p className="text-[10px] font-bold text-red-500">{errors.rueCode.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Nombre Oficial del Establecimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('institutionName')}
                    placeholder="Unidad Educativa Colegio Che Guevara"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Tal como aparece en la Resolución Administrativa</span>
                  {errors.institutionName && <p className="text-[10px] font-bold text-red-500">{errors.institutionName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Tipo de Dependencia
                  </label>
                  <SwissSelect
                    value={formValues.dependencyType}
                    placeholder="Seleccione dependencia..."
                    onChange={(val) => setValue('dependencyType', val as any)}
                    options={[
                      { value: 'FISCAL', label: 'Fiscal / Pública' },
                      { value: 'CONVENIO', label: 'De Convenio' },
                      { value: 'PRIVADA', label: 'Privada' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Departamento (Bolivia)
                  </label>
                  <SwissSelect
                    value={formValues.department}
                    placeholder="Seleccione departamento..."
                    onChange={(val) => setValue('department', val as any)}
                    options={[
                      { value: 'CHUQUISACA', label: 'Chuquisaca' },
                      { value: 'LA_PAZ', label: 'La Paz' },
                      { value: 'COCHABAMBA', label: 'Cochabamba' },
                      { value: 'SANTA_CRUZ', label: 'Santa Cruz' },
                      { value: 'POTOSI', label: 'Potosí' },
                      { value: 'ORURO', label: 'Oruro' },
                      { value: 'TARIJA', label: 'Tarija' },
                      { value: 'BENI', label: 'Beni' },
                      { value: 'PANDO', label: 'Pando' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Municipio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('municipality')}
                    placeholder="Ej. Sucre"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Distrito Educativo <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('district')}
                    placeholder="Ej. Sucre 1"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Dirección Física del Colegio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('address')}
                    placeholder="Ej. Zona Villa Armonía, Calle Principal #123"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.address && <p className="text-[10px] font-bold text-red-500">{errors.address.message}</p>}
                </div>

                {/* Turnos y Niveles */}
                <div className="space-y-2 md:col-span-2 pt-3 border-t border-gray-200">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Turnos Operativos Habilitados <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'MANANA', label: 'Turno Mañana' },
                      { id: 'TARDE', label: 'Turno Tarde' },
                      { id: 'NOCHE', label: 'Turno Noche' },
                    ].map((t) => {
                      const isSelected = formValues.shifts?.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleArrayItem('shifts', t.id)}
                          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-uecg-blue text-white border-uecg-blue shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{t.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.shifts && <p className="text-[10px] font-bold text-red-500">{errors.shifts.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Niveles Educativos Autorizados <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'INICIAL', label: 'Inicial en Familia Comunitaria' },
                      { id: 'PRIMARIA', label: 'Primaria Comunitaria Vocacional' },
                      { id: 'SECUNDARIA', label: 'Secundaria Comunitaria Productiva' },
                    ].map((l) => {
                      const isSelected = formValues.levels?.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => toggleArrayItem('levels', l.id)}
                          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-uecg-blue text-white border-uecg-blue shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{l.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.levels && <p className="text-[10px] font-bold text-red-500">{errors.levels.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Operación & Asistencia */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-200 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sliders className="w-3.5 h-3.5" /> Parámetros del Motor Operativo
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">
                  3. Reglas de Horarios y Control de Asistencia
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Configure cómo se asignan los salones de clase y los márgenes de tolerancia para el escáner QR móvil.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Modo de Programación y Asignación de Aulas
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      onClick={() => setValue('schedulingMode', 'FIXED_BASE')}
                      className={`p-4 border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                        formValues.schedulingMode === 'FIXED_BASE'
                          ? 'border-uecg-blue bg-blue-50/50 ring-2 ring-uecg-blue shadow-sm'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-uecg-blue">
                          1. Aula Fija / Tradicional (Recomendado)
                        </span>
                        {formValues.schedulingMode === 'FIXED_BASE' && (
                          <CheckCircle2 className="w-4 h-4 text-uecg-blue" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Cada curso (ej. 3ro A) tiene su salón permanente asignado. Los profesores rotan de aula salvo en materias especiales (Computación, Canchas).
                      </p>
                    </label>

                    <label
                      onClick={() => setValue('schedulingMode', 'DYNAMIC')}
                      className={`p-4 border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                        formValues.schedulingMode === 'DYNAMIC'
                          ? 'border-uecg-blue bg-blue-50/50 ring-2 ring-uecg-blue shadow-sm'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-uecg-blue">
                          2. Aulas Dinámicas / Rotativas
                        </span>
                        {formValues.schedulingMode === 'DYNAMIC' && (
                          <CheckCircle2 className="w-4 h-4 text-uecg-blue" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Los alumnos se desplazan de aula en aula según la materia y el profesor titular de cada salón o laboratorio temático.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Tolerancia de Atraso (Minutos)
                  </label>
                  <input
                    type="number"
                    {...register('lateToleranceMinutes')}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Margen de gracia tras el toque de timbre (Puntual vs Atraso)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] block">
                    Límite para Falta Injustificada (Minutos)
                  </label>
                  <input
                    type="number"
                    {...register('absentToleranceMinutes')}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 focus:border-uecg-blue focus:bg-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-gray-500">Pasado este tiempo el escáner marcará falta automática</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Resumen y Puesta en Marcha */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-200 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resumen de Puesta en Marcha
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">
                  4. Confirmación y Registro Final
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Revise los datos antes de inicializar la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 bg-gray-50/80 space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Directora / Administrador Principal
                  </h4>
                  <p className="text-xs font-bold text-gray-900">{formValues.fullName}</p>
                  <p className="text-xs text-gray-600">CI: {formValues.ci}</p>
                  <p className="text-xs text-gray-600">Email: {formValues.email}</p>
                </div>

                <div className="p-4 border border-gray-200 bg-gray-50/80 space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Unidad Educativa &bull; RUE
                  </h4>
                  <p className="text-xs font-bold text-gray-900">{formValues.institutionName}</p>
                  <p className="text-xs text-gray-600">Código RUE: {formValues.rueCode}</p>
                  <p className="text-xs text-gray-600">
                    {formValues.department} &bull; {formValues.municipality} ({formValues.district})
                  </p>
                </div>

                <div className="p-4 border border-gray-200 bg-gray-50/80 space-y-1.5 md:col-span-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Turnos, Niveles y Motor Operativo
                  </h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600">
                    <div><strong>Turnos:</strong> {formValues.shifts?.join(', ')}</div>
                    <div><strong>Niveles:</strong> {formValues.levels?.join(', ')}</div>
                    <div><strong>Horarios:</strong> {formValues.schedulingMode === 'FIXED_BASE' ? 'Aula Fija' : 'Aulas Dinámicas'}</div>
                    <div><strong>Tolerancia Asistencia:</strong> {formValues.lateToleranceMinutes} min atraso / {formValues.absentToleranceMinutes} min falta</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border-l-4 border-uecg-blue text-xs text-gray-700 leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 text-uecg-blue shrink-0 mt-0.5" />
                <div>
                  <strong>Asistente Interactivo de Primera Gestión:</strong> Al hacer clic en <em>"Inicializar Colegio y Comenzar Guía"</em>, el sistema creará tu sesión de inmediato y abrirá el <strong>Tour Interactivo (Driver.js)</strong> para guiarte en la creación del primer año lectivo, cursos y profesores.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-2.5 text-xs font-black uppercase tracking-wider bg-[#000089] text-white hover:bg-blue-800 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                Siguiente <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2.5 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registrando en Base de Datos...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Inicializar Colegio y Comenzar Guía
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* BOTTOM FOOTER */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/20 pt-4 text-center sm:text-left">
        <p className="text-[10px] text-blue-200 tracking-wider uppercase font-medium">
          Unidad Educativa Colegio Che Guevara &bull; Plataforma Integral de Gestión Académica
        </p>
        <p className="text-[9px] text-blue-300/80 uppercase font-mono tracking-widest">
          Ley 070 &bull; Avelino Siñani - Elizardo Pérez
        </p>
      </footer>
    </div>
  );
}
