import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// O app só usa o Firebase Authentication (login/cadastro/e-mail de
// redefinição de senha) diretamente pelo SDK client. Todo o resto dos
// dados (dispositivos, leituras, alertas) passa exclusivamente pela API
// Node.js — o app nunca lê/escreve no Realtime Database diretamente
// (ver firebase.rules.json na API, que bloqueia esse acesso por padrão).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // No React Native, initializeAuth com persistência em AsyncStorage
  // mantém o usuário logado entre aberturas do app.
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };
