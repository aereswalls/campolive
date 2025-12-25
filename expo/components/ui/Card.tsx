import React from 'react'
import { View, ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated'
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
  }

  return (
    <View 
      className={`rounded-xl p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  )
}
