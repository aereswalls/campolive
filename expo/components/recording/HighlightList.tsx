import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import { Video, Trash2, Share2, Clock } from 'lucide-react-native'
import { Card } from '@/components/ui'
import type { SavedHighlight } from '@/types'

interface HighlightListProps {
  highlights: SavedHighlight[]
  onDelete?: (id: string) => void
  onShare?: (highlight: SavedHighlight) => void
  onPlay?: (highlight: SavedHighlight) => void
}

export function HighlightList({ highlights, onDelete, onShare, onPlay }: HighlightListProps) {
  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds)}s`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderHighlight = ({ item, index }: { item: SavedHighlight; index: number }) => (
    <Card className="mb-3">
      <TouchableOpacity 
        onPress={() => onPlay?.(item)}
        className="flex-row items-center"
      >
        {/* Thumbnail */}
        <View className="w-20 h-14 bg-gray-800 rounded-lg items-center justify-center mr-3">
          {item.thumbnailUri ? (
            <Image 
              source={{ uri: item.thumbnailUri }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Video size={24} color="#9ca3af" />
          )}
          <View className="absolute bottom-1 right-1 bg-black/70 px-1 rounded">
            <Text className="text-white text-xs">{formatDuration(item.duration)}</Text>
          </View>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">
            Highlight #{index + 1}
          </Text>
          <View className="flex-row items-center mt-1">
            <Clock size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-500 ml-1">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row space-x-2">
          {onShare && (
            <TouchableOpacity
              onPress={() => onShare(item)}
              className="p-2"
            >
              <Share2 size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              className="p-2"
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  )

  if (highlights.length === 0) {
    return (
      <View className="items-center py-8">
        <Video size={48} color="#d1d5db" />
        <Text className="text-gray-500 mt-2">Nessun highlight salvato</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={highlights}
      keyExtractor={(item) => item.id}
      renderItem={renderHighlight}
      showsVerticalScrollIndicator={false}
    />
  )
}
