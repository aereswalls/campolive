import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'

interface ButtonProps {
  onPress: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-lg'
  
  const variantStyles = {
    primary: 'bg-green-600 active:bg-green-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    danger: 'bg-red-600 active:bg-red-700',
    outline: 'bg-transparent border-2 border-green-600',
  }
  
  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    danger: 'text-white',
    outline: 'text-green-600',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }
  
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#16a34a' : '#fff'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold ${textStyles[variant]} ${textSizeStyles[size]}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
