import React, { useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native'
import { Link, router } from 'expo-router'
import { Mail, Lock, User, UserPlus } from 'lucide-react-native'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  
  const { signUp, isLoading } = useAuthStore()

  const validate = () => {
    const newErrors: typeof errors = {}
    
    if (!fullName) {
      newErrors.fullName = 'Nome richiesto'
    }
    
    if (!email) {
      newErrors.email = 'Email richiesta'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email non valida'
    }
    
    if (!password) {
      newErrors.password = 'Password richiesta'
    } else if (password.length < 6) {
      newErrors.password = 'Almeno 6 caratteri'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Conferma la password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return

    try {
      await signUp(email, password, fullName)
      Alert.alert(
        'Registrazione completata',
        'Controlla la tua email per confermare l\'account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (error: any) {
      Alert.alert(
        'Errore registrazione',
        error.message || 'Si è verificato un errore. Riprova.'
      )
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-100"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo/Title */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-green-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">⚽</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">CampoLive</Text>
            <Text className="text-gray-500 mt-1">Crea il tuo account</Text>
          </View>

          {/* Register Form */}
          <Card className="p-6">
            <Text className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Registrazione
            </Text>

            <Input
              label="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Mario Rossi"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.fullName}
              leftIcon={<User size={20} color="#9ca3af" />}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="mario@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              leftIcon={<Mail size={20} color="#9ca3af" />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
              hint="Minimo 6 caratteri"
              leftIcon={<Lock size={20} color="#9ca3af" />}
            />

            <Input
              label="Conferma Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color="#9ca3af" />}
            />

            <Button
              title="Crea Account"
              onPress={handleRegister}
              loading={isLoading}
              className="mt-4"
              icon={<UserPlus size={20} color="#fff" />}
            />
          </Card>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Hai già un account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-green-600 font-semibold">Accedi</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
