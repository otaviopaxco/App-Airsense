import * as SecureStore from 'expo-secure-store';

/**
 * Wrapper fino sobre o expo-secure-store (Keychain/Keystore nativo).
 * Usado só para dados sensíveis de sessão; o resto do estado do app vive
 * em memória (Context) e é recarregado da API a cada abertura de tela.
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ambiente sem Keychain/Keystore disponível (ex.: web) — ignora.
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // no-op
    }
  },
};

export const STORAGE_KEYS = {
  pushToken: 'airsense.pushToken',
} as const;
