import React, { useState } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router, Stack } from 'expo-router'
import { Users, MapPin, FileText, Shield } from 'lucide-react-native'
import { Button, Input, Card } from '@/components/ui'
import { useTeams } from '@/hooks/useTeams'
import { TEAM_LEVELS } from '@/constants'

export default function NewTeamScreen() {
  const { createTeam } = useTeams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    city: '',
    level: 'amateur',
    description: '',
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
      const team = await createTeam({
        name: form.name,
        city: form.city || undefined,
        level: form.level as any,
        description: form.description || undefined,
      })

      if (team) {
        Alert.alert(
          '✅ Squadra Creata',
          `La squadra "${form.name}" è stata creata con successo!`,
          [{ text: 'OK', onPress: () => router.replace(`/team/${team.id}`) }]
        )
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile creare la squadra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nuova Squadra' }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-gray-100">
          <View className="p-4">
            <Card className="p-4 mb-4">
              <View className="flex-row items-center mb-4">
                <Shield size={24} color="#2563eb" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Informazioni Squadra
                </Text>
              </View>

              <Input
                label="Nome Squadra *"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="es. FC Esempio"
                error={errors.name}
                leftIcon={<Users size={20} color="#9ca3af" />}
              />

              <Input
                label="Città"
                value={form.city}
                onChangeText={(text) => setForm({ ...form, city: text })}
                placeholder="es. Milano"
                leftIcon={<MapPin size={20} color="#9ca3af" />}
              />

              {/* Level Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Livello</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TEAM_LEVELS.map((level) => (
                    <View
                      key={level.value}
                      className={`px-4 py-2 rounded-lg border ${
                        form.level === level.value
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onTouchEnd={() => setForm({ ...form, level: level.value })}
                    >
                      <Text
                        className={
                          form.level === level.value ? 'text-white' : 'text-gray-700'
                        }
                      >
                        {level.label}
                      </Text>
                    </View>
                  ))}
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
              title="Crea Squadra"
              onPress={handleCreate}
              loading={loading}
              icon={<Users size={20} color="#fff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
