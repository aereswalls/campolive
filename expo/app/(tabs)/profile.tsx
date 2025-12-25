import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { 
  User, 
  Mail, 
  Star, 
  LogOut, 
  ChevronRight,
  CreditCard,
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react-native'
import { Card, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function ProfileScreen() {
  const { user, credits, signOut, refreshCredits } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshCredits()
    setRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/login')
          }
        },
      ]
    )
  }

  const menuItems = [
    {
      icon: CreditCard,
      label: 'Acquista Crediti',
      description: 'Ricarica il tuo saldo',
      onPress: () => router.push('/credits'),
      badge: credits?.credits?.toString(),
    },
    {
      icon: Settings,
      label: 'Impostazioni',
      description: 'Preferenze app',
      onPress: () => {},
    },
    {
      icon: HelpCircle,
      label: 'Assistenza',
      description: 'Supporto e FAQ',
      onPress: () => {},
    },
    {
      icon: Shield,
      label: 'Privacy & Termini',
      description: 'Leggi le policy',
      onPress: () => {},
    },
  ]

  return (
    <ScrollView 
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <User size={40} color="#16a34a" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {user?.user_metadata?.full_name || 'Utente'}
            </Text>
            <View className="flex-row items-center mt-1">
              <Mail size={14} color="#9ca3af" />
              <Text className="text-gray-500 ml-1">{user?.email}</Text>
            </View>
          </View>

          {/* Credits */}
          <View className="mt-6 pt-6 border-t border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Star size={24} color="#eab308" fill="#eab308" />
                <View className="ml-3">
                  <Text className="text-sm text-gray-500">Crediti disponibili</Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {credits?.credits || 0}
                  </Text>
                </View>
              </View>
              <Button
                title="Acquista"
                size="sm"
                onPress={() => router.push('/credits')}
              />
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card className="mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className={`flex-row items-center p-4 ${
                index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <item.icon size={20} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.label}</Text>
                <Text className="text-sm text-gray-500">{item.description}</Text>
              </View>
              {item.badge && (
                <Badge variant="warning" size="sm">{item.badge}</Badge>
              )}
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          icon={<LogOut size={20} color="#fff" />}
        />

        {/* Version */}
        <Text className="text-center text-gray-400 text-sm mt-6">
          CampoLive v1.0.0
        </Text>
      </View>
    </ScrollView>
  )
}
