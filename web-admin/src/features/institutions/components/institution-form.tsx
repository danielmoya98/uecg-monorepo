import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Save, MapPin, Phone, GraduationCap, Loader2, BookOpen, Clock } from 'lucide-react';
import { institutionSchema, type InstitutionFormValues } from '../schemas/institutions.schema';
import type { Institution, InstitutionPayload } from '../types/institutions.types';
import SwissSelect from './swiss-select';

interface InstitutionFormProps {
  initialData: Institution | null;
  isSubmitting: boolean;
  onSubmit: (data: InstitutionPayload) => void;
}

export default function InstitutionForm({
  initialData,
  isSubmitting,
  onSubmit,
}: InstitutionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema) as Resolver<InstitutionFormValues>,
    defaultValues: {
      shifts: [],
      levels: [],
      dependencyType: 'FISCAL',
      department: 'CHUQUISACA',
      schedulingMode: 'FIXED_BASE',
      rueCode: '',
      name: '',
      municipality: '',
      district: '',
      address: '',
      phone: '',
      email: '',
      foundedYear: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        rueCode: initialData.rueCode,
        name: initialData.name,
        dependencyType: initialData.dependencyType,
        department: initialData.department,
        municipality: initialData.municipality,
        district: initialData.district,
        address: initialData.address,
        phone: initialData.phone || '',
        email: initialData.email || '',
        foundedYear: initialData.foundedYear || '',
        shifts: initialData.shifts,
        levels: initialData.levels,
        schedulingMode: initialData.schedulingMode,
      });
    }
  }, [initialData, reset]);

  const currentShifts = watch('shifts') || [];
  const currentLevels = watch('levels') || [];
  const currentDept = watch('department');
  const currentDepType = watch('dependencyType');

  const toggleArrayItem = (field: 'shifts' | 'levels', val: string) => {
    const currentArray = watch(field) || [];
    const newArray = currentArray.includes(val)
      ? currentArray.filter((i) => i !== val)
      : [...currentArray, val];
    setValue(field, newArray, { shouldValidate: true, shouldDirty: true });
  };

  const handleFormSubmit = (data: InstitutionFormValues) => {
    const payload: InstitutionPayload = {
      ...data,
      foundedYear: data.foundedYear ? Number(data.foundedYear) : null,
      email: data.email === '' ? undefined : data.email,
      phone: data.phone === '' ? undefined : data.phone,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      <input type="hidden" {...register('department')} />
      <input type="hidden" {...register('dependencyType')} />

      {/* Identidad Oficial */}
      <section className="bg-white border border-uecg-line p-6 shadow-sm">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Identidad Oficial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4">
            <label htmlFor="rueCode" className="label-swiss !mb-1.5 block">
              Código RUE / SIE
            </label>
            <input
              id="rueCode"
              type="text"
              {...register('rueCode')}
              placeholder="Ej. 80730145"
              aria-invalid={!!errors.rueCode}
              aria-describedby={errors.rueCode ? 'rueCode-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-black tracking-widest uppercase shadow-inner focus:bg-white ${
                errors.rueCode ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.rueCode && (
              <p id="rueCode-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.rueCode.message}
              </p>
            )}
          </div>

          <div className="md:col-span-8">
            <label htmlFor="name" className="label-swiss !mb-1.5 block">
              Nombre de la Institución
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Unidad Educativa..."
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-black uppercase shadow-inner focus:bg-white ${
                errors.name ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="md:col-span-8">
            <label htmlFor="dependencyType" className="label-swiss !mb-1.5 block">
              Tipo de Dependencia
            </label>
            <SwissSelect
              id="dependencyType"
              value={currentDepType || ''}
              onChange={(val) =>
                setValue('dependencyType', val as 'FISCAL' | 'PRIVADA' | 'CONVENIO', {
                  shouldValidate: true,
                })
              }
              options={[
                { value: 'FISCAL', label: 'FISCAL (PÚBLICO)' },
                { value: 'PRIVADA', label: 'PRIVADA' },
                { value: 'CONVENIO', label: 'DE CONVENIO' },
              ]}
              placeholder="-- SELECCIONAR --"
              disabled={isSubmitting}
              hasError={!!errors.dependencyType}
            />
            {errors.dependencyType && (
              <p className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.dependencyType.message}
              </p>
            )}
          </div>

          <div className="md:col-span-4">
            <label htmlFor="foundedYear" className="label-swiss !mb-1.5 block">
              Año de Fundación
            </label>
            <input
              id="foundedYear"
              type="number"
              {...register('foundedYear')}
              placeholder="Ej. 2005"
              aria-invalid={!!errors.foundedYear}
              aria-describedby={errors.foundedYear ? 'foundedYear-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-black tracking-widest text-center shadow-inner focus:bg-white ${
                errors.foundedYear ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.foundedYear && (
              <p id="foundedYear-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.foundedYear.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Ubicación Geográfica y Contacto */}
      <section className="bg-white border border-uecg-line p-6 shadow-sm">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Ubicación Geográfica y Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative z-20">
            <label htmlFor="department" className="label-swiss !mb-1.5 block">
              Departamento
            </label>
            <SwissSelect
              id="department"
              value={currentDept || ''}
              onChange={(val) => setValue('department', val as InstitutionFormValues['department'], { shouldValidate: true })}
              options={[
                { value: 'CHUQUISACA', label: 'CHUQUISACA' },
                { value: 'LA_PAZ', label: 'LA PAZ' },
                { value: 'COCHABAMBA', label: 'COCHABAMBA' },
                { value: 'SANTA_CRUZ', label: 'SANTA CRUZ' },
                { value: 'POTOSI', label: 'POTOSÍ' },
                { value: 'ORURO', label: 'ORURO' },
                { value: 'TARIJA', label: 'TARIJA' },
                { value: 'BENI', label: 'BENI' },
                { value: 'PANDO', label: 'PANDO' },
              ]}
              placeholder="-- DEPARTAMENTO --"
              disabled={isSubmitting}
              hasError={!!errors.department}
            />
            {errors.department && (
              <p className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.department.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="municipality" className="label-swiss !mb-1.5 block">
              Municipio
            </label>
            <input
              id="municipality"
              type="text"
              {...register('municipality')}
              aria-invalid={!!errors.municipality}
              aria-describedby={errors.municipality ? 'municipality-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase shadow-inner focus:bg-white ${
                errors.municipality ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.municipality && (
              <p id="municipality-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.municipality.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="district" className="label-swiss !mb-1.5 block">
              Distrito Educativo
            </label>
            <input
              id="district"
              type="text"
              {...register('district')}
              aria-invalid={!!errors.district}
              aria-describedby={errors.district ? 'district-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase shadow-inner focus:bg-white ${
                errors.district ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.district && (
              <p id="district-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.district.message}
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <label htmlFor="address" className="label-swiss !mb-1.5 block">
              Dirección Exacta
            </label>
            <input
              id="address"
              type="text"
              {...register('address')}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold uppercase shadow-inner focus:bg-white ${
                errors.address ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p id="address-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="md:col-span-1">
            <label htmlFor="phone" className="label-swiss !mb-1.5 flex items-center gap-1.5 block">
              <Phone className="w-3 h-3" /> Teléfono
            </label>
            <input
              id="phone"
              type="text"
              {...register('phone')}
              className="w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:border-uecg-blue focus:outline-none text-xs font-bold tracking-widest shadow-inner focus:bg-white"
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="label-swiss !mb-1.5 block">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full border bg-gray-50 px-3 py-2.5 text-uecg-text focus:outline-none text-xs font-bold lowercase shadow-inner focus:bg-white ${
                errors.email ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-[9px] text-red-500 font-bold uppercase">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Motor de Horarios y Aulas */}
      <section className="bg-white border border-uecg-line p-6 shadow-sm">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Motor de Horarios y Aulas
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <span className="label-swiss !mb-0 block">Modo de Asignación de Infraestructura</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`border p-5 cursor-pointer transition-colors flex gap-3 shadow-sm ${
                watch('schedulingMode') === 'FIXED_BASE'
                  ? 'border-uecg-blue bg-blue-50/30'
                  : 'border-uecg-line bg-gray-50 hover:border-uecg-blue'
              }`}
            >
              <input
                type="radio"
                value="FIXED_BASE"
                {...register('schedulingMode')}
                className="mt-0.5 accent-uecg-blue w-4 h-4"
                disabled={isSubmitting}
              />
              <div>
                <h4
                  className={`text-xs font-black uppercase tracking-widest ${
                    watch('schedulingMode') === 'FIXED_BASE' ? 'text-uecg-blue' : 'text-uecg-dark'
                  }`}
                >
                  Aula Base Fija (Tradicional)
                </h4>
                <p className="text-[10px] text-uecg-gray mt-1 leading-relaxed font-bold">
                  Cada curso tiene un salón asignado para todo el año.
                </p>
              </div>
            </label>

            <label
              className={`border p-5 cursor-pointer transition-colors flex gap-3 shadow-sm ${
                watch('schedulingMode') === 'DYNAMIC'
                  ? 'border-uecg-blue bg-blue-50/30'
                  : 'border-uecg-line bg-gray-50 hover:border-uecg-blue'
              }`}
            >
              <input
                type="radio"
                value="DYNAMIC"
                {...register('schedulingMode')}
                className="mt-0.5 accent-uecg-blue w-4 h-4"
                disabled={isSubmitting}
              />
              <div>
                <h4
                  className={`text-xs font-black uppercase tracking-widest ${
                    watch('schedulingMode') === 'DYNAMIC' ? 'text-uecg-blue' : 'text-uecg-dark'
                  }`}
                >
                  Aulas Dinámicas (Rotativo)
                </h4>
                <p className="text-[10px] text-uecg-gray mt-1 leading-relaxed font-bold">
                  Los estudiantes rotan de salón constantemente.
                </p>
              </div>
            </label>
          </div>
          {errors.schedulingMode && (
            <p className="text-[9px] text-red-500 font-bold uppercase">
              {errors.schedulingMode.message}
            </p>
          )}
        </div>
      </section>

      {/* Autorizaciones de Operación RUE */}
      <section className="bg-white border border-uecg-line p-6 shadow-sm">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> Autorizaciones de Operación RUE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <span className="label-swiss !text-[10px] mb-3 flex items-center gap-1.5 block">
              <Clock className="w-3.5 h-3.5" /> Turnos Operativos Habilitados
            </span>
            <div className="flex flex-col gap-2">
              {['MANANA', 'TARDE', 'NOCHE'].map((shift) => (
                <button
                  type="button"
                  key={shift}
                  onClick={() => toggleArrayItem('shifts', shift)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 p-3 border transition-colors text-left disabled:opacity-50 outline-none cursor-pointer ${
                    currentShifts.includes(shift)
                      ? 'border-uecg-blue bg-blue-50/20'
                      : 'border-uecg-line bg-gray-50 hover:border-uecg-blue'
                  }`}
                >
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                      currentShifts.includes(shift)
                        ? 'bg-uecg-blue border-uecg-blue'
                        : 'border-gray-400 bg-white'
                    }`}
                  >
                    {currentShifts.includes(shift) && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest ${
                      currentShifts.includes(shift) ? 'text-uecg-blue' : 'text-uecg-text'
                    }`}
                  >
                    Turno {shift === 'MANANA' ? 'MAÑANA' : shift}
                  </span>
                </button>
              ))}
            </div>
            {errors.shifts && (
              <p className="mt-1.5 text-[9px] text-red-500 font-bold uppercase">
                {errors.shifts.message}
              </p>
            )}
          </div>

          <div>
            <span className="label-swiss !text-[10px] mb-3 flex items-center gap-1.5 block">
              <GraduationCap className="w-3.5 h-3.5" /> Niveles Educativos Impartidos
            </span>
            <div className="flex flex-col gap-2">
              {['INICIAL', 'PRIMARIA', 'SECUNDARIA'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => toggleArrayItem('levels', level)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 p-3 border transition-colors text-left disabled:opacity-50 outline-none cursor-pointer ${
                    currentLevels.includes(level)
                      ? 'border-uecg-blue bg-blue-50/20'
                      : 'border-uecg-line bg-gray-50 hover:border-uecg-blue'
                  }`}
                >
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                      currentLevels.includes(level)
                        ? 'bg-uecg-blue border-uecg-blue'
                        : 'border-gray-400 bg-white'
                    }`}
                  >
                    {currentLevels.includes(level) && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest ${
                      currentLevels.includes(level) ? 'text-uecg-blue' : 'text-uecg-text'
                    }`}
                  >
                    Educación {level}
                  </span>
                </button>
              ))}
            </div>
            {errors.levels && (
              <p className="mt-1.5 text-[9px] text-red-500 font-bold uppercase">
                {errors.levels.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-10 py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 outline-none cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />{' '}
              {initialData ? 'Actualizar Ficha Institucional' : 'Registrar Colegio'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
