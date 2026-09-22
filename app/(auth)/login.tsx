import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../src/components/GradientScreen';
import { TextField } from '../../src/components/TextField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setErro(null);
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await login(email, senha);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBox}>
            <View style={styles.logoIcone}>
              <Image 
                source={require('../../assets/images/adaptive-icon.png')} // Altere para o nome do seu arquivo
                style={styles.logoPng} 
              />
            </View>
            <Text style={styles.marca}>AirSense</Text>
            <Text style={styles.slogan}>Monitoramento de qualidade do ar</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.titulo}>Entrar</Text>

            <TextField
              label="E-mail"
              icon="mail-outline"
              placeholder="voce@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField label="Senha" icon="lock-closed-outline" placeholder="••••••••" isPassword value={senha} onChangeText={setSenha} />

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <Link href="/(auth)/forgot-password" style={styles.link}>
              Esqueci minha senha
            </Link>

            <PrimaryButton label="Login" onPress={entrar} loading={carregando} style={{ marginTop: 8 }} />
          </View>

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Não possui uma conta?</Text>
            <Link href="/(auth)/signup" replace style={styles.rodapeLink}>
              Criar conta
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoIcone: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  marca: { color: colors.text.primary, fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  slogan: { color: colors.text.secondary, fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: colors.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
  },
  titulo: { color: colors.text.primary, fontSize: 20, fontWeight: '700', marginBottom: 18, textAlign: 'center' },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: 18 },
  rodape: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
  rodapeTexto: { color: colors.text.secondary, fontSize: 13 },
  rodapeLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  logoPng: {
    width: 70,          // Mesma largura do tamanho do Ionicons anterior
    height: 70,         // Mesma altura do tamanho do Ionicons anterior
    resizeMode: 'contain', // Garante que a imagem não fique distorcida
  },
});
