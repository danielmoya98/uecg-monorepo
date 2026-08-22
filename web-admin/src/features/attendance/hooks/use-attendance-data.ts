import { useQuery } from '@tanstack/react-query'
import { AttendanceService } from '../api/attendance.service'

const getLocalDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useAttendanceData = () => {
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['attendanceSettings'],
    queryFn: AttendanceService.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos de stale time para configuración
  })

  const today = getLocalDateString()

  const { data: dailyBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['attendanceDailySchedule', today],
    queryFn: () => AttendanceService.getDailySchedule(today),
    staleTime: 30 * 1000, // Refrescar los bloques cada 30 segundos
  })

  return {
    settings,
    loadingSettings,
    dailyBlocks: dailyBlocks || [],
    isLoadingBlocks,
  }
}
