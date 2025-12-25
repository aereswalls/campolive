import React, { useState } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router, Stack } from 'expo-router'
import { Calendar, MapPin, FileText, Clock, Video } from 'lucide-react-native'
import { Button, Input, Card } from '@/components/ui'
import { useEvents } from '@/hooks/useEvents'
import { EVENT_TYPES } from '@/constants'

export default function NewEventScreen() {
  const { createEvent } = useEvents()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    event_type: 'match',
    location: '',
    description: '',
    date: '',
    time: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.name.trim()) {
      newErrors.name = 'Nome richiesto'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const event = await createEvent({
        name: form.name,
        event_type: form.event_type as any,
        location: form.location || undefined,
        description: form.description || undefined,
        date: form.date || undefined,
        time: form.time || undefined,
      })

      if (event) {
        Alert.alert(
          '✅ Evento Creato',
          `L'evento "${form.name}" è stato creato con successo!`,
          [{ text: 'OK', onPress: () => router.replace(`/event/${event.id}`) }]
        )
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile creare l\'evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nuovo Evento' }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-gray-100">
          <View className="p-4">
            <Card className="p-4 mb-4">
              <View className="flex-row items-center mb-4">
                <Video size={24} color="#7c3aed" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Informazioni Evento
                </Text>
              </View>

              <Input
                label="Nome Evento *"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="es. Finale Torneo Primavera"
                error={errors.name}
              />

              {/* Event Type Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Tipo Evento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2">
                    {EVENT_TYPES.map((type) => (
                      <View
                        key={type.value}
                        className={`px-4 py-2 rounded-full border ${
                          form.event_type === type.value
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-gray-300'
                        }`}
                        onTouchEnd={() => setForm({ ...form, event_type: type.value })}
                      >
                        <Text
                          className={
                            form.event_type === type.value ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {type.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Input
                label="Luogo"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
                placeholder="es. Stadio Comunale"
                leftIcon={<MapPin size={20} color="#9ca3af" />}
              />

              <View className="flex-row space-x-2">
                <View className="flex-1">
                  <Input
                    label="Data"
                    value={form.date}
                    onChangeText={(text) => setForm({ ...form, date: text })}
                    placeholder="YYYY-MM-DD"
                    leftIcon={<Calendar size={20} color="#9ca3af" />}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Ora"
                    value={form.time}
                    onChangeText={(text) => setForm({ ...form, time: text })}
                    placeholder="HH:MM"
                    leftIcon={<Clock size={20} color="#9ca3af" />}
                  />
                </View>
              </View>

              <Input
                label="Descrizione"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Descrizione opzionale..."
                multiline
                numberOfLines={3}
                leftIcon={<FileText size={20} color="#9ca3af" />}
              />
            </Card>

            <Button
              title="Crea Evento"
              onPress={handleCreate}
              loading={loading}
              icon={<Calendar size={20} color="#fff" />}
            />

            <View className="mt-4 p-4 bg-blue-50 rounded-lg">
              <Text className="text-blue-800 text-sm text-center">
                💡 Dopo aver creato l'evento, potrai avviare la registrazione video
                e salvare gli highlights in tempo reale.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
