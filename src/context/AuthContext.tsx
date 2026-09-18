import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (email: string, senha: string) => Promise<void>;
  redefinirSenha: (email: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Traduz os códigos de erro do Firebase Auth para mensagens amigáveis em PT-BR.
function traduzirErro(err: any): string {
  const codigo = err?.code || '';
  const mapa: Record<string, string> = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/missing-password': 'Informe uma senha.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  };
  return mapa[codigo] || 'Não foi possível concluir. Tente novamente.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async login(email, senha) {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), senha);
        } catch (err) {
          throw new Error(traduzirErro(err));
        }
      },
      async cadastrar(email, senha) {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), senha);
        } catch (err) {
          throw new Error(traduzirErro(err));
        }
      },
      async redefinirSenha(email) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (err) {
          throw new Error(traduzirErro(err));
        }
      },
      async sair() {
        await signOut(auth);
      },
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
