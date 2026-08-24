import React, { forwardRef } from 'react'
import { MorphIcon as BaseMorphIcon, type MorphHandle } from 'morphicons/react'
import type { LucideIcon } from 'lucide-react'

export interface SwissMorphIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'from' | 'to'> {
  icon: LucideIcon | any
  size?: number | string
  strokeWidth?: number | string
  className?: string
  color?: string
}

/**
 * Componente Wrapper para Morphicons con compatibilidad total con Lucide Icons y TypeScript.
 */
export const SwissMorphIcon = forwardRef<MorphHandle, SwissMorphIconProps>(function SwissMorphIcon(
  { icon, size = 16, strokeWidth = 2, className = '', color = 'currentColor', ...props },
  ref
) {
  const iconInput = (icon as any)?._iconNode || (icon as any)?.__iconNode || (icon as any)

  return (
    <BaseMorphIcon
      ref={ref}
      icon={iconInput}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      {...props}
    />
  )
})

export { SwissMorphIcon as MorphIcon }
export default SwissMorphIcon
