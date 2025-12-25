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
import { Mail, Lock, LogIn } from 'lucide-react-native'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const { signIn, isLoading } = useAuthStore()

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email richiesta'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email non valida'
    }
    
    if (!password) {
      newErrors.password = 'Password richiesta'
    } else if (password.length < 6) {
      newErrors.password = 'La password deve avere almeno 6 caratteri'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return

    try {
      await signIn(email, password)
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert(
        'Errore di login',
        error.message || 'Credenziali non valide. Riprova.'
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
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-green-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">⚽</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">CampoLive</Text>
            <Text className="text-gray-500 mt-1">Gestisci i tuoi tornei ovunque</Text>
          </View>

          {/* Login Form */}
          <Card className="p-6">
            <Text className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Accedi al tuo account
            </Text>

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
              autoComplete="password"
              error={errors.password}
              leftIcon={<Lock size={20} color="#9ca3af" />}
            />

            <Button
              title="Accedi"
              onPress={handleLogin}
              loading={isLoading}
              className="mt-4"
              icon={<LogIn size={20} color="#fff" />}
            />

            <TouchableOpacity className="mt-4">
              <Text className="text-green-600 text-center">
                Password dimenticata?
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Non hai un account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-green-600 font-semibold">Registrati</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
