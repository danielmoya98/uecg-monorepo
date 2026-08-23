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
} from 'lucide-react';
import { AuthService } from '@/features/auth/api/auth.service';
import { useTourStore } from '@/features/academic-years/store/use-tour-store';
import { setupWizardSchema, type SetupWizardFormValues } from '../../schemas/setup-wizard.schema';
import SwissSelect from '../swiss-select';

const STEPS = [
  { id: 1, title: 'Directora / Administradora', subtitle: 'Acreditación del usuario principal', icon: ShieldCheck },
  { id: 2, title: 'Identidad del Colegio', subtitle: 'Estructura legal RUE / SIE', icon: Building2 },
  { id: 3, title: 'Operación & Asistencia', subtitle: 'Parámetros y tolerancias', icon: Sliders },
  { id: 4, title: 'Puesta en Marcha', subtitle: 'Revisión final y arranque', icon: Sparkles },
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
      const response = await AuthService.setupInitialDirector(data);
      if (response?.user) {
        AuthService.saveSessionMetadata(response.user);
      }
      toast.success('¡COLEGIO E INSTITUCIÓN REGISTRADOS CON ÉXITO!', {
        description: 'Bienvenida a la plataforma. Iniciando el asistente de puesta en marcha...',
      });
      // Iniciar el tour desde el inicio
      startTour(0);
      navigate({ to: '/dashboard' as any });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al inicializar el colegio';
      toast.error('ERROR DE INICIALIZACIÓN', { description: typeof msg === 'string' ? msg : msg[0] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-uecg-canvas flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-uecg-blue selection:text-white">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-uecg-line pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-uecg-blue text-white flex items-center justify-center font-black tracking-widest text-sm shadow-sm">
            UE
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-uecg-black">
              Colegio Che Guevara
            </h1>
            <p className="text-[10px] text-uecg-gray tracking-widest uppercase">
              Asistente de Primer Arranque &bull; Setup Wizard
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-uecg-blue uppercase tracking-widest bg-blue-50 px-2.5 py-1 border border-blue-200">
            Paso {currentStep} de 4
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Progress Step Bar */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <div
                key={s.id}
                className={`p-3 border transition-all flex flex-col justify-between gap-2 ${
                  isCurrent
                    ? 'border-uecg-blue bg-white shadow-sm ring-1 ring-uecg-blue'
                    : isDone
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                      : 'border-uecg-line bg-white/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    0{s.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-uecg-blue' : isDone ? 'text-emerald-600' : 'text-uecg-gray'}`} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight line-clamp-1">{s.title}</h3>
                  <p className="text-[9px] text-uecg-gray hidden sm:block line-clamp-1">{s.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-uecg-line p-6 md:p-8 flex-1 flex flex-col justify-between shadow-xs">
          {/* STEP 1: Directora */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-uecg-line pb-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <User className="w-3 h-3" /> Cuenta Directiva Principal
                </div>
                <h2 className="text-lg font-black text-uecg-black tracking-tight">
                  1. Registro de la Directora / Administradora
                </h2>
                <p className="text-xs text-uecg-gray">
                  Esta cuenta tendrá los permisos supremos para gestionar la estructura académica, el personal docente y las credenciales oficiales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Nombre Completo &bull; Título Oficial <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="Ej. Lic. María Elena Ramos"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Cédula de Identidad (CI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('ci')}
                    placeholder="Ej. 1234567 CH"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.ci && <p className="text-[10px] text-red-500">{errors.ci.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Correo Electrónico de Acceso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="directora@uecg.edu.bo"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Contraseña Maestra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.password && <p className="text-[10px] text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Teléfono Celular / Contacto de Emergencia
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="Ej. 78901234"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Institución */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-uecg-line pb-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <School className="w-3 h-3" /> Ficha SIE / RUE
                </div>
                <h2 className="text-lg font-black text-uecg-black tracking-tight">
                  2. Datos Oficiales de la Unidad Educativa
                </h2>
                <p className="text-xs text-uecg-gray">
                  Datos de acreditación ante el Ministerio de Educación del Estado Plurinacional de Bolivia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Código RUE / SIE <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('rueCode')}
                    placeholder="Ej. 80730145"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.rueCode && <p className="text-[10px] text-red-500">{errors.rueCode.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Nombre Oficial del Colegio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('institutionName')}
                    placeholder="Unidad Educativa Colegio Che Guevara"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.institutionName && <p className="text-[10px] text-red-500">{errors.institutionName.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Municipio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('municipality')}
                    placeholder="Ej. Sucre"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Distrito Educativo <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('district')}
                    placeholder="Ej. Sucre 1"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Dirección Física del Establecimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('address')}
                    placeholder="Ej. Zona Villa Armonía, Calle Principal #123"
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  {errors.address && <p className="text-[10px] text-red-500">{errors.address.message}</p>}
                </div>

                {/* Turnos y Niveles */}
                <div className="space-y-2 md:col-span-2 pt-2 border-t border-uecg-line">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black block">
                    Turnos Operativos Autorizados <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'MANANA', label: 'Mañana' },
                      { id: 'TARDE', label: 'Tarde' },
                      { id: 'NOCHE', label: 'Noche' },
                    ].map((t) => {
                      const isSelected = formValues.shifts?.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleArrayItem('shifts', t.id)}
                          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-uecg-blue text-white border-uecg-blue'
                              : 'bg-white text-uecg-black border-uecg-line hover:bg-neutral-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{t.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.shifts && <p className="text-[10px] text-red-500">{errors.shifts.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black block">
                    Niveles Educativos Habilitados <span className="text-red-500">*</span>
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
                          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-uecg-blue text-white border-uecg-blue'
                              : 'bg-white text-uecg-black border-uecg-line hover:bg-neutral-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{l.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.levels && <p className="text-[10px] text-red-500">{errors.levels.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Operación & Asistencia */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-uecg-line pb-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-uecg-blue border border-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sliders className="w-3 h-3" /> Motor Operativo
                </div>
                <h2 className="text-lg font-black text-uecg-black tracking-tight">
                  3. Reglas de Horarios y Asistencia
                </h2>
                <p className="text-xs text-uecg-gray">
                  Configure cómo operan las aulas físicas y el control de puntualidad en la App Móvil.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black block">
                    Modo de Asignación de Aulas y Horarios
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label
                      onClick={() => setValue('schedulingMode', 'FIXED_BASE')}
                      className={`p-4 border cursor-pointer flex flex-col justify-between gap-2 transition-all ${
                        formValues.schedulingMode === 'FIXED_BASE'
                          ? 'border-uecg-blue bg-blue-50/40 ring-1 ring-uecg-blue'
                          : 'border-uecg-line bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-uecg-black">
                          Aula Fija / Tradicional
                        </span>
                        {formValues.schedulingMode === 'FIXED_BASE' && (
                          <CheckCircle2 className="w-4 h-4 text-uecg-blue" />
                        )}
                      </div>
                      <p className="text-[11px] text-uecg-gray leading-relaxed">
                        Los alumnos permanecen en un salón base fijo y los profesores rotan de curso. (Recomendado).
                      </p>
                    </label>

                    <label
                      onClick={() => setValue('schedulingMode', 'DYNAMIC')}
                      className={`p-4 border cursor-pointer flex flex-col justify-between gap-2 transition-all ${
                        formValues.schedulingMode === 'DYNAMIC'
                          ? 'border-uecg-blue bg-blue-50/40 ring-1 ring-uecg-blue'
                          : 'border-uecg-line bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-uecg-black">
                          Aulas Dinámicas / Rotativas
                        </span>
                        {formValues.schedulingMode === 'DYNAMIC' && (
                          <CheckCircle2 className="w-4 h-4 text-uecg-blue" />
                        )}
                      </div>
                      <p className="text-[11px] text-uecg-gray leading-relaxed">
                        Los alumnos se desplazan a laboratorios, talleres y aulas temáticas según la materia.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Tolerancia de Atraso (Minutos)
                  </label>
                  <input
                    type="number"
                    {...register('lateToleranceMinutes')}
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-uecg-gray">Margen de gracia tras el toque de timbre</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-uecg-black">
                    Límite para Falta Injustificada (Minutos)
                  </label>
                  <input
                    type="number"
                    {...register('absentToleranceMinutes')}
                    className="w-full px-3 py-2 text-xs border border-uecg-line focus:border-uecg-blue focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-uecg-gray">Pasado este tiempo se marca como falta</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Revisión Final */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-uecg-line pb-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Resumen de Configuración
                </div>
                <h2 className="text-lg font-black text-uecg-black tracking-tight">
                  4. Confirmación y Puesta en Marcha
                </h2>
                <p className="text-xs text-uecg-gray">
                  Verifique que la información sea exacta antes de inicializar la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-uecg-line bg-neutral-50/50 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Acreditación Directiva
                  </h4>
                  <p className="text-xs font-bold text-uecg-black">{formValues.fullName}</p>
                  <p className="text-xs text-uecg-gray">CI: {formValues.ci}</p>
                  <p className="text-xs text-uecg-gray">Email: {formValues.email}</p>
                </div>

                <div className="p-4 border border-uecg-line bg-neutral-50/50 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Ficha RUE del Establecimiento
                  </h4>
                  <p className="text-xs font-bold text-uecg-black">{formValues.institutionName}</p>
                  <p className="text-xs text-uecg-gray">Código RUE: {formValues.rueCode}</p>
                  <p className="text-xs text-uecg-gray">
                    {formValues.department} &bull; {formValues.municipality} ({formValues.district})
                  </p>
                </div>

                <div className="p-4 border border-uecg-line bg-neutral-50/50 space-y-2 md:col-span-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
                    Capacidades & Modo Operativo
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs text-uecg-gray">
                    <div><strong>Turnos:</strong> {formValues.shifts?.join(', ')}</div>
                    <div><strong>Niveles:</strong> {formValues.levels?.join(', ')}</div>
                    <div><strong>Modo Horario:</strong> {formValues.schedulingMode === 'FIXED_BASE' ? 'Aula Fija' : 'Aulas Dinámicas'}</div>
                    <div><strong>Tolerancia:</strong> {formValues.lateToleranceMinutes} min atraso / {formValues.absentToleranceMinutes} min falta</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-2 border-uecg-blue p-3 text-xs text-uecg-gray leading-relaxed">
                💡 <strong>Asistencia Inicial:</strong> Al hacer clic en <em>"Inicializar Colegio y Comenzar Guía"</em>, el sistema creará tu sesión de inmediato y abrirá el <strong>Tour Interactivo</strong> para guiarte en la configuración del año lectivo, cursos y profesores.
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-uecg-line mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider border border-uecg-line text-uecg-black hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
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
                className="px-6 py-2 text-xs font-black uppercase tracking-wider bg-uecg-blue text-white hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Siguiente <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
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
    </div>
  );
}
