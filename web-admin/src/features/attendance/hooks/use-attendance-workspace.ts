import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import type { DailyBlock } from '../types/attendance.types'

export type AttendanceTab = 'monitor' | 'scanner' | 'justifications'

export const useAttendanceWorkspace = () => {
  const { can } = useRouteContext({ from: '/_authenticated' })

  const [activeTab, setActiveTab] = useState<AttendanceTab>('monitor')
  const [selectedBlock, setSelectedBlock] = useState<DailyBlock | null>(null)

  const canJustify = can('manage:all', 'Attendance')
  const isPowerUser = can('manage:all', 'Attendance') || can('read:all', 'Attendance')

  return {
    activeTab,
    setActiveTab,
    selectedBlock,
    setSelectedBlock,
    canJustify,
    isPowerUser,
  }
}
