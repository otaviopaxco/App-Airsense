import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_NOTIFICACOES = 'airsense.preferencias.notificacoesAtivas';

interface PreferencesContextValue {
  notificacoesAtivas: boolean;
  carregado: boolean;
  alternarNotificacoes: (valor: boolean) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_NOTIFICACOES)
      .then((valor) => {
        if (valor !== null) setNotificacoesAtivas(valor === 'true');
      })
      .finally(() => setCarregado(true));
  }, []);

  async function alternarNotificacoes(valor: boolean) {
    setNotificacoesAtivas(valor);
    await AsyncStorage.setItem(CHAVE_NOTIFICACOES, String(valor));
  }

  return (
    <PreferencesContext.Provider value={{ notificacoesAtivas, carregado, alternarNotificacoes }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences precisa estar dentro de <PreferencesProvider>');
  return ctx;
}
