import React, { useState } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router, Stack } from 'expo-router'
import { Trophy, Calendar, MapPin, Users, FileText } from 'lucide-react-native'
import { Button, Input, Card } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { SPORTS, TOURNAMENT_FORMATS } from '@/constants'

export default function NewTournamentScreen() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sport: 'calcio',
    format: 'league',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
    max_teams: '8',
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
    if (!user) {
      Alert.alert('Errore', 'Devi essere autenticato')
      return
    }

    setLoading(true)
    try {
      // Genera slug
      const slug = form.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: form.name,
          slug,
          sport: form.sport,
          format: form.format,
          location: form.location || null,
          description: form.description || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          max_teams: parseInt(form.max_teams) || 8,
          owner_id: user.id,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error

      Alert.alert(
        '✅ Torneo Creato',
        `Il torneo "${form.name}" è stato creato con successo!`,
        [{ text: 'OK', onPress: () => router.replace(`/tournament/${data.id}`) }]
      )
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile creare il torneo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nuovo Torneo' }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-gray-100">
          <View className="p-4">
            <Card className="p-4 mb-4">
              <View className="flex-row items-center mb-4">
                <Trophy size={24} color="#16a34a" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Informazioni Torneo
                </Text>
              </View>

              <Input
                label="Nome Torneo *"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="es. Torneo Primavera 2024"
                error={errors.name}
              />

              {/* Sport Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Sport</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2">
                    {SPORTS.map((sport) => (
                      <View
                        key={sport.value}
                        className={`px-4 py-2 rounded-full border ${
                          form.sport === sport.value
                            ? 'bg-green-600 border-green-600'
                            : 'bg-white border-gray-300'
                        }`}
                        onTouchEnd={() => setForm({ ...form, sport: sport.value })}
                      >
                        <Text
                          className={
                            form.sport === sport.value ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {sport.emoji} {sport.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Format Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Formato</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TOURNAMENT_FORMATS.map((format) => (
                    <View
                      key={format.value}
                      className={`px-4 py-2 rounded-lg border ${
                        form.format === format.value
                          ? 'bg-green-600 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onTouchEnd={() => setForm({ ...form, format: format.value })}
                    >
                      <Text
                        className={
                          form.format === format.value ? 'text-white' : 'text-gray-700'
                        }
                      >
                        {format.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Input
                label="Luogo"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
                placeholder="es. Campo Sportivo Comunale"
                leftIcon={<MapPin size={20} color="#9ca3af" />}
              />

              <Input
                label="Max Squadre"
                value={form.max_teams}
                onChangeText={(text) => setForm({ ...form, max_teams: text })}
                keyboardType="number-pad"
                placeholder="8"
                leftIcon={<Users size={20} color="#9ca3af" />}
              />

              <Input
                label="Descrizione"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Descrizione opzionale del torneo..."
                multiline
                numberOfLines={3}
                leftIcon={<FileText size={20} color="#9ca3af" />}
              />
            </Card>

            <Button
              title="Crea Torneo"
              onPress={handleCreate}
              loading={loading}
              icon={<Trophy size={20} color="#fff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
