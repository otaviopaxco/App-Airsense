import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../../src/components/GradientScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { api } from '../../../src/lib/api';
import type { ResumoResponse } from '../../../src/types';
import { colors } from '../../../src/theme/colors';

export default function VisaoGeralScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumo, setResumo] = useState<ResumoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(
    async (viaPullToRefresh = false) => {
      if (!user) return;
      viaPullToRefresh ? setAtualizando(true) : setCarregando(true);
      try {
        const dados = await api.getResumo(user.uid);
        setResumo(dados);
      } catch {
        // silencioso — a tela mostra o último resumo carregado (ou o estado vazio)
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const contagem = resumo?.contagemPorStatus ?? { Ativo: 0, Offline: 0, Alerta: 0, Erro: 0 };
  const emailUsuario = user?.email || '';
  const nomeExibicao = emailUsuario.split('@')[0];

  const cartoes = [
    { chave: 'total', label: 'Total de aparelhos', valor: resumo?.totalDispositivos ?? 0, cor: colors.accent, icone: 'hardware-chip-outline' as const },
    { chave: 'Ativo', label: 'Online', valor: contagem.Ativo, cor: colors.status.Ativo, icone: 'checkmark-circle-outline' as const },
    { chave: 'Offline', label: 'Offline', valor: contagem.Offline, cor: colors.status.Offline, icone: 'cloud-offline-outline' as const },
    { chave: 'Alerta', label: 'Em alerta', valor: contagem.Alerta, cor: colors.status.Alerta, icone: 'warning-outline' as const },
    { chave: 'Erro', label: 'Com erro', valor: contagem.Erro, cor: colors.status.Erro, icone: 'close-circle-outline' as const },
  ];

  return (
    <GradientScreen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.saudacao}>Visão geral</Text>
        <Text style={styles.nome}>Olá, {nomeExibicao}</Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.conteudo}
          refreshControl={<RefreshControl tintColor={colors.accent} refreshing={atualizando} onRefresh={() => carregar(true)} />}
        >
          <View style={styles.grid}>
            {cartoes.map((c) => (
              <View key={c.chave} style={[styles.cartao, c.chave === 'total' && styles.cartaoGrande]}>
                <View style={[styles.iconeCirculo, { backgroundColor: c.cor + '22' }]}>
                  <Ionicons name={c.icone} size={20} color={c.cor} />
                </View>
                <Text style={[styles.cartaoValor, { color: c.cor }]}>{c.valor}</Text>
                <Text style={styles.cartaoLabel}>{c.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.acoes}>
            <Pressable style={styles.acaoBotao} onPress={() => router.push('/(app)/aparelhos')}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.accent} />
              <Text style={styles.acaoTexto}>Ver aparelhos</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </Pressable>
            <Pressable style={styles.acaoBotao} onPress={() => router.push('/(app)/alertas')}>
              <Ionicons name="notifications-outline" size={18} color={colors.accent} />
              <Text style={styles.acaoTexto}>Ver alertas ativos</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  saudacao: { color: colors.text.secondary, fontSize: 13 },
  nome: { color: colors.text.primary, fontSize: 24, fontWeight: '800', marginTop: 2, textTransform: 'capitalize' },
  conteudo: { paddingHorizontal: 20, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cartao: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    padding: 16,
  },
  cartaoGrande: { width: '100%' },
  iconeCirculo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cartaoValor: { fontSize: 28, fontWeight: '800' },
  cartaoLabel: { color: colors.text.secondary, fontSize: 12, marginTop: 4 },
  acoes: { marginTop: 20, gap: 10 },
  acaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
  },
  acaoTexto: { flex: 1, color: colors.text.primary, fontWeight: '600', fontSize: 13 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
