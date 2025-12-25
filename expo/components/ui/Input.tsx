import React from 'react'
import { View, Text, TextInput, TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <TextInput
        className={`
          w-full px-4 py-3 border rounded-lg bg-white text-gray-900
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
      )}
    </View>
  )
}
