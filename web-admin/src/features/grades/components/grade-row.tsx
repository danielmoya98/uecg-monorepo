import type { StudentGradeRowData, GradeInput } from '../types/grades.types'

interface GradeRowProps {
  studentData: StudentGradeRowData
  isTrimesterOpen: boolean
  scores: GradeInput
  onScoreChange: (field: keyof GradeInput, value: string) => void
}

export const GradeRow = ({
  studentData,
  isTrimesterOpen,
  scores,
  onScoreChange,
}: GradeRowProps) => {
  const studentName = `${studentData.student.lastNamePaterno} ${studentData.student.lastNameMaterno} ${studentData.student.names}`

  const totalPreview =
    (Number(scores.ser) || 0) +
    (Number(scores.saber) || 0) +
    (Number(scores.hacer) || 0) +
    (Number(scores.auto) || 0)
  const needsRecovery = totalPreview < 51 && totalPreview > 0

  let finalPreview = totalPreview
  if (needsRecovery && scores.recovery !== '') {
    finalPreview = Math.min(Number(scores.recovery), 51)
  }
  const isFailingFinal = finalPreview < 51 && finalPreview > 0

  const handleInputChange = (field: keyof GradeInput, value: string, max: number) => {
    if (!isTrimesterOpen) return
    if (value === '') {
      onScoreChange(field, '')
      return
    }
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0 && num <= max) {
      onScoreChange(field, num.toString())
    }
  }

  const inputClass = `w-full h-full text-center text-sm font-black tabular-nums focus:outline-none placeholder-gray-300 transition-colors ${
    !isTrimesterOpen
      ? 'bg-gray-100 cursor-not-allowed text-uecg-gray'
      : 'bg-transparent focus:bg-blue-50/50'
  }`
  const recoveryInputClass = `w-full h-full text-center text-sm font-black tabular-nums focus:outline-none placeholder-red-200 text-red-700 transition-colors ${
    !isTrimesterOpen ? 'bg-red-50/50 cursor-not-allowed' : 'bg-red-50 focus:bg-red-100'
  }`

  return (
    <tr className="border-b border-uecg-line hover:bg-gray-50/50 transition-colors group">
      <td className="p-3 text-[11px] font-black uppercase tracking-tight text-uecg-dark">
        {studentName}
      </td>
      <td className="p-0 border-l border-uecg-line w-16 relative">
        <input
          type="number"
          min="0"
          max="10"
          placeholder="-"
          aria-label={`Nota SER de ${studentName}`}
          className={inputClass}
          value={scores.ser}
          onChange={(e) => handleInputChange('ser', e.target.value, 10)}
          disabled={!isTrimesterOpen}
        />
      </td>
      <td className="p-0 border-l border-uecg-line w-16 relative">
        <input
          type="number"
          min="0"
          max="45"
          placeholder="-"
          aria-label={`Nota SABER de ${studentName}`}
          className={inputClass}
          value={scores.saber}
          onChange={(e) => handleInputChange('saber', e.target.value, 45)}
          disabled={!isTrimesterOpen}
        />
      </td>
      <td className="p-0 border-l border-uecg-line w-16 relative">
        <input
          type="number"
          min="0"
          max="40"
          placeholder="-"
          aria-label={`Nota HACER de ${studentName}`}
          className={inputClass}
          value={scores.hacer}
          onChange={(e) => handleInputChange('hacer', e.target.value, 40)}
          disabled={!isTrimesterOpen}
        />
      </td>
      <td className="p-0 border-l border-uecg-line w-16 relative">
        <input
          type="number"
          min="0"
          max="5"
          placeholder="-"
          aria-label={`Nota AUTOCONTROL de ${studentName}`}
          className={inputClass}
          value={scores.auto}
          onChange={(e) => handleInputChange('auto', e.target.value, 5)}
          disabled={!isTrimesterOpen}
        />
      </td>
      <td className="p-2 border-l border-uecg-line text-center w-16 font-black tabular-nums text-xs text-uecg-gray bg-gray-50/50">
        {totalPreview || '-'}
      </td>
      <td className="p-0 border-l border-uecg-line w-20 relative bg-red-50/30">
        {needsRecovery ? (
          <input
            type="number"
            min="0"
            max="100"
            placeholder="REC."
            aria-label={`Nota RECUPERACIÓN de ${studentName}`}
            className={recoveryInputClass}
            value={scores.recovery}
            onChange={(e) => handleInputChange('recovery', e.target.value, 100)}
            disabled={!isTrimesterOpen}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">-</div>
        )}
      </td>
      <td
        className={`p-3 border-l border-uecg-line text-center w-20 font-black tabular-nums text-sm transition-colors ${
          isFailingFinal ? 'bg-red-100 text-red-700' : 'bg-uecg-dark text-white'
        }`}
      >
        {finalPreview || '-'}
      </td>
    </tr>
  )
}
