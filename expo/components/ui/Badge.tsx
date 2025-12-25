import React from 'react'
import { View, Text } from 'react-native'

interface BadgeProps {
  text: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ text, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <View className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}>
      <Text className={`font-medium ${variantStyles[variant].split(' ')[1]}`}>
        {text}
      </Text>
    </View>
  )
}
