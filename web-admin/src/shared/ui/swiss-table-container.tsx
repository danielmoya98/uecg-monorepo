import React from 'react'

export interface SwissTableContainerProps {
  children: React.ReactNode
  isFetching?: boolean
  isPending?: boolean
  className?: string
}

export function SwissTableContainer({
  children,
  isFetching = false,
  isPending = false,
  className = '',
}: SwissTableContainerProps) {
  return (
    <div
      className={`border border-uecg-line bg-white pb-16 shadow-sm overflow-x-auto custom-scrollbar transition-opacity duration-200 ${
        isFetching && !isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  )
}
export default SwissTableContainer
