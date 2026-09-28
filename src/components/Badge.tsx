import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  )
}
