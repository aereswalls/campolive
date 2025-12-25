import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { router, Stack } from 'expo-router'
import { Star, Zap, Check, CreditCard } from 'lucide-react-native'
import { Card, Badge, Button, Loading } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import type { CreditPackage } from '@/types'

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: 9.99,
    currency: 'EUR',
    description: 'Perfetto per iniziare',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    price: 39.99,
    currency: 'EUR',
    description: 'Il più popolare',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 100,
    price: 69.99,
    currency: 'EUR',
    description: 'Miglior rapporto qualità/prezzo',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 500,
    price: 299.99,
    currency: 'EUR',
    description: 'Per organizzazioni',
    popular: false
  }
]

export default function CreditsScreen() {
  const { credits, refreshCredits } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshCredits()
    setRefreshing(false)
  }

  const handlePurchase = async (pkg: CreditPackage) => {
    setLoading(true)
    setSelectedPackage(pkg.id)

    try {
      // In produzione, qui integreresti Stripe o PayPal
      Alert.alert(
        'Acquisto',
        `Stai per acquistare ${pkg.credits} crediti per €${pkg.price.toFixed(2)}.\n\nQuesta è una versione demo. In produzione verrà aperto il pagamento Stripe/PayPal.`,
        [
          { text: 'Annulla', style: 'cancel' },
          { 
            text: 'Simula Acquisto', 
            onPress: async () => {
              // Simula l'acquisto (solo per demo)
              // In produzione, questo avverrebbe dopo il pagamento
              Alert.alert(
                '✅ Acquisto Completato',
                `Hai ricevuto ${pkg.credits} crediti!`
              )
              await refreshCredits()
            }
          }
        ]
      )
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante l\'acquisto')
    } finally {
      setLoading(false)
      setSelectedPackage(null)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Acquista Crediti' }} />
      
      <ScrollView 
        className="flex-1 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Current Balance */}
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/80 text-sm">Saldo Attuale</Text>
                <View className="flex-row items-center mt-1">
                  <Star size={28} color="#fff" fill="#fff" />
                  <Text className="text-white text-4xl font-bold ml-2">
                    {credits?.credits || 0}
                  </Text>
                </View>
                <Text className="text-white/80 text-sm mt-1">crediti disponibili</Text>
              </View>
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
                <Zap size={32} color="#fff" />
              </View>
            </View>
          </Card>

          {/* Info */}
          <Card className="mb-6 p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              A cosa servono i crediti?
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Check size={16} color="#16a34a" className="mt-0.5" />
                <Text className="text-gray-600 ml-2 flex-1">
                  Streaming live degli eventi
                </Text>
              </View>
              <View className="flex-row items-start">
                <Check size={16} color="#16a34a" className="mt-0.5" />
                <Text className="text-gray-600 ml-2 flex-1">
                  Salvataggio e condivisione highlights
                </Text>
              </View>
              <View className="flex-row items-start">
                <Check size={16} color="#16a34a" className="mt-0.5" />
                <Text className="text-gray-600 ml-2 flex-1">
                  Storage cloud per i video
                </Text>
              </View>
              <View className="flex-row items-start">
                <Check size={16} color="#16a34a" className="mt-0.5" />
                <Text className="text-gray-600 ml-2 flex-1">
                  Funzionalità premium
                </Text>
              </View>
            </View>
          </Card>

          {/* Packages */}
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Scegli un pacchetto
          </Text>
          
          {CREDIT_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => handlePurchase(pkg)}
              disabled={loading}
            >
              <Card 
                className={`mb-3 p-4 ${pkg.popular ? 'border-2 border-green-500' : ''}`}
              >
                {pkg.popular && (
                  <View className="absolute -top-2 right-4">
                    <Badge variant="success" size="sm">Più Popolare</Badge>
                  </View>
                )}
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{pkg.name}</Text>
                    <Text className="text-gray-500 text-sm">{pkg.description}</Text>
                    <View className="flex-row items-center mt-2">
                      <Star size={18} color="#eab308" fill="#eab308" />
                      <Text className="text-yellow-600 font-semibold ml-1">
                        {pkg.credits} crediti
                      </Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-gray-900">
                      €{pkg.price.toFixed(2)}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      €{(pkg.price / pkg.credits).toFixed(2)}/credito
                    </Text>
                    {selectedPackage === pkg.id && loading ? (
                      <View className="mt-2">
                        <Text className="text-green-600">Caricamento...</Text>
                      </View>
                    ) : (
                      <View className="bg-green-600 px-4 py-2 rounded-lg mt-2">
                        <Text className="text-white font-semibold">Acquista</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Payment Methods */}
          <Card className="mt-4 p-4">
            <Text className="text-sm text-gray-500 text-center mb-3">
              Metodi di pagamento accettati
            </Text>
            <View className="flex-row justify-center space-x-4">
              <View className="bg-gray-100 px-4 py-2 rounded">
                <Text className="font-semibold text-gray-700">Stripe</Text>
              </View>
              <View className="bg-gray-100 px-4 py-2 rounded">
                <Text className="font-semibold text-gray-700">PayPal</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-400 text-center mt-3">
              I pagamenti sono sicuri e crittografati
            </Text>
          </Card>
        </View>
      </ScrollView>
    </>
  )
}
