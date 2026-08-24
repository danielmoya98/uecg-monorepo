import { useState, useCallback, useMemo } from 'react'

export function useBatchSelection<T extends { id: string | number }>(items: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  const isAllSelected = useMemo(() => {
    if (!items || items.length === 0) return false
    return items.length > 0 && items.every((item) => selectedIds.has(item.id))
  }, [items, selectedIds])

  const isIndeterminate = useMemo(() => {
    if (!items || items.length === 0) return false
    return selectedIds.size > 0 && !isAllSelected
  }, [items, selectedIds, isAllSelected])

  const toggleSelect = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }, [items, isAllSelected])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  )

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  }
}
