import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../../src/components/GradientScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { usePreferences } from '../../../src/context/PreferencesContext';
import { api } from '../../../src/lib/api';
import { colors } from '../../../src/theme/colors';

export default function ConfiguracoesScreen() {
  const { user, sair } = useAuth();
  const { notificacoesAtivas, alternarNotificacoes } = usePreferences();

  const versao = Constants.expoConfig?.version ?? '1.0.0';

  async function aoAlternarNotificacoes(valor: boolean) {
    await alternarNotificacoes(valor);
    // Se o usuário desligou, também removemos o push token no servidor —
    // assim ele para de receber notificações mesmo se abrir o app de novo
    // antes de reativar (o token só é registrado de novo quando ligar aqui).
    if (!valor && user) {
      try {
        const { getExpoPushTokenAsync } = await import('expo-notifications');
        const tokenResp = await getExpoPushTokenAsync();
        await api.removerPushToken(user.uid, tokenResp.data);
      } catch {
        // sem push registrado ainda / sem permissão — nada a remover.
      }
    }
  }

  function confirmarSaida() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  return (
    <GradientScreen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Configurações</Text>
      </View>

      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={26} color={colors.accent} />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.secao}>
        <View style={styles.linha}>
          <View style={styles.linhaTexto}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
            <View>
              <Text style={styles.linhaTitulo}>Notificações de alertas</Text>
              <Text style={styles.linhaSub}>Push e popup no app quando um sensor entrar em alerta</Text>
            </View>
          </View>
          <Switch
            value={notificacoesAtivas}
            onValueChange={aoAlternarNotificacoes}
            trackColor={{ true: colors.accent, false: colors.cardBorder }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.secao}>
        <View style={styles.linha}>
          <View style={styles.linhaTexto}>
            <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.linhaTitulo}>Versão do app</Text>
          </View>
          <Text style={styles.valor}>{versao}</Text>
        </View>
      </View>

      <Pressable style={styles.sairBotao} onPress={confirmarSaida}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.sairTexto}>Sair da conta</Text>
      </Pressable>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  titulo: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  perfil: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  email: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  secao: { marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  linhaTexto: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  linhaTitulo: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  linhaSub: { color: colors.text.muted, fontSize: 11, marginTop: 2, maxWidth: 220 },
  valor: { color: colors.text.secondary, fontSize: 13 },
  sairBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  sairTexto: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
