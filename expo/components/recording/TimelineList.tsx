import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Video, Trash2, Share2, Clock, Upload, Tag } from 'lucide-react-native'
import type { TimelineClip } from '@/types'
import { ACTION_TAGS } from '@/types'

interface TimelineListProps {
  clips: TimelineClip[]
  onDelete?: (id: string) => void
  onShare?: (clip: TimelineClip) => void
  onPlay?: (clip: TimelineClip) => void
  onUpload?: (clip: TimelineClip) => void
}

export function TimelineList({ clips, onDelete, onShare, onPlay, onUpload }: TimelineListProps) {
  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds)}s`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTagInfo = (tagId: string) => {
    return ACTION_TAGS.find(t => t.id === tagId)
  }

  const renderClip = ({ item, index }: { item: TimelineClip; index: number }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => onPlay?.(item)}
        style={styles.cardContent}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {item.thumbnailUri ? (
            <Image 
              source={{ uri: item.thumbnailUri }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <Video size={24} color="#9ca3af" />
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
          {item.isUploaded && (
            <View style={styles.uploadedBadge}>
              <Upload size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.clipTitle}>Clip #{index + 1}</Text>
          
          {/* Tags */}
          {item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map(tagId => {
                const tag = getTagInfo(tagId)
                if (!tag) return null
                return (
                  <View 
                    key={tagId} 
                    style={[styles.tagPill, { backgroundColor: tag.color }]}
                  >
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  </View>
                )
              })}
            </View>
          )}
          
          <View style={styles.timeRow}>
            <Clock size={12} color="#9ca3af" />
            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onUpload && !item.isUploaded && (
            <TouchableOpacity
              onPress={() => onUpload(item)}
              style={styles.actionButton}
            >
              <Upload size={20} color="#22c55e" />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              onPress={() => onShare(item)}
              style={styles.actionButton}
            >
              <Share2 size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.actionButton}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )

  if (clips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Video size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>Nessun clip nella timeline</Text>
        <Text style={styles.emptySubtext}>
          Registra e premi "Salva" per aggiungere clip
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={clips}
      keyExtractor={(item) => item.id}
      renderItem={renderClip}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 56,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  uploadedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#22c55e',
    padding: 2,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  clipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagEmoji: {
    fontSize: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
})
