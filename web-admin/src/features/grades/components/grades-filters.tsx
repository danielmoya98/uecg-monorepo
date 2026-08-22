import { CustomSelect, type Option } from './custom-select'

interface GradesFiltersProps {
  selectedTrimester: string
  setSelectedTrimester: (v: string) => void
  trimestersOptions: Option[]

  selectedClassroom: string
  setSelectedClassroom: (v: string) => void
  classroomsOptions: Option[]

  selectedAssignment: string
  setSelectedAssignment: (v: string) => void
  assignmentsOptions: Option[]
}

export const GradesFilters = ({
  selectedTrimester,
  setSelectedTrimester,
  trimestersOptions,
  selectedClassroom,
  setSelectedClassroom,
  classroomsOptions,
  selectedAssignment,
  setSelectedAssignment,
  assignmentsOptions,
}: GradesFiltersProps) => (
  <div className="bg-white border border-uecg-line shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-50">
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
        1. Trimestre
      </label>
      <CustomSelect
        value={selectedTrimester}
        onChange={setSelectedTrimester}
        options={trimestersOptions}
        placeholder="SELECCIONAR"
      />
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
        2. Curso
      </label>
      <CustomSelect
        value={selectedClassroom}
        onChange={setSelectedClassroom}
        options={classroomsOptions}
        placeholder="SELECCIONAR"
        disabled={!selectedTrimester}
      />
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
        3. Materia
      </label>
      <CustomSelect
        value={selectedAssignment}
        onChange={setSelectedAssignment}
        options={assignmentsOptions}
        placeholder="SELECCIONAR"
        disabled={!selectedClassroom}
      />
    </div>
  </div>
)
