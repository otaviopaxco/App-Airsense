import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../src/components/GradientScreen';
import { TextField } from '../../src/components/TextField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function ForgotPasswordScreen() {
  const { redefinirSenha } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    setErro(null);
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    setCarregando(true);
    try {
      await redefinirSenha(email);
      setEnviado(true);
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
              <Ionicons name="key-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.marca}>Redefinir senha</Text>
            <Text style={styles.slogan}>Enviaremos um link de redefinição por e-mail</Text>
          </View>

          <View style={styles.card}>
            {enviado ? (
              <View style={styles.sucesso}>
                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={styles.sucessoTexto}>
                  Enviamos um e-mail para <Text style={{ fontWeight: '700' }}>{email}</Text> com um link para
                  redefinir sua senha. Verifique também a caixa de spam.
                </Text>
                <PrimaryButton label="Voltar ao login" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 12, width: '100%' }} />
              </View>
            ) : (
              <>
                <TextField
                  label="E-mail cadastrado"
                  icon="mail-outline"
                  placeholder="voce@exemplo.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                {erro ? <Text style={styles.erro}>{erro}</Text> : null}
                <PrimaryButton label="Enviar link" onPress={enviar} loading={carregando} style={{ marginTop: 8 }} />
                <PrimaryButton label="Voltar" variant="ghost" onPress={() => router.back()} style={{ marginTop: 12 }} />
              </>
            )}
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
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  marca: { color: colors.text.primary, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  slogan: { color: colors.text.secondary, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: colors.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
  },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  sucesso: { alignItems: 'center', paddingVertical: 10 },
  sucessoTexto: { color: colors.text.secondary, fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
