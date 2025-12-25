import React from 'react'
import { View, Text } from 'react-native'
import { AlertCircle } from 'lucide-react-native'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4">
        {icon || <AlertCircle size={48} color="#9ca3af" />}
      </View>
      <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-600 text-center mb-4">{description}</Text>
      )}
      {action}
    </View>
  )
}
