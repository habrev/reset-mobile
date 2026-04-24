import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

import LoginScreen from '../screens/LoginScreen'
import InputScreen from '../screens/InputScreen'
import ProcessingScreen from '../screens/ProcessingScreen'
import ResultsScreen from '../screens/ResultsScreen'
import AdminScreen from '../screens/AdminScreen'

const Stack = createNativeStackNavigator()

export default function Navigation() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Input" component={InputScreen} />
            <Stack.Screen name="Processing" component={ProcessingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
