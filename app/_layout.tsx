import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AlertsProvider } from '../src/context/AlertsContext';
import { PreferencesProvider } from '../src/context/PreferencesContext';
import { AlertPopup } from '../src/components/AlertPopup';
import { colors } from '../src/theme/colors';

function Navegacao() {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const emGrupoAuth = segments[0] === '(auth)';

    if (!user && !emGrupoAuth) {
      router.replace('/(auth)/login');
    } else if (user && emGrupoAuth) {
      router.replace('/(app)');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return <View style={{ flex: 1, backgroundColor: colors.bg.top }} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <AlertPopup />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PreferencesProvider>
          <AlertsProvider>
            <StatusBar style="light" />
            <Navegacao />
          </AlertsProvider>
        </PreferencesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
