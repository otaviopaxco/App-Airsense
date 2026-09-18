import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../../src/components/GradientScreen';
import { DeviceCard } from '../../../src/components/DeviceCard';
import { AddDeviceModal } from '../../../src/components/AddDeviceModal';
import { SearchFilterBar } from '../../../src/components/SearchFilterBar';
import { useAuth } from '../../../src/context/AuthContext';
import { useAlerts } from '../../../src/context/AlertsContext';
import { api } from '../../../src/lib/api';
import type { DispositivoResumo, StatusDispositivo } from '../../../src/types';
import { colors } from '../../../src/theme/colors';

const OPCOES_FILTRO: { valor: 'Todos' | StatusDispositivo; label: string }[] = [
  { valor: 'Todos', label: 'Todos' },
  { valor: 'Ativo', label: 'Só online' },
  { valor: 'Offline', label: 'Só offline' },
  { valor: 'Alerta', label: 'Só em alerta' },
  { valor: 'Erro', label: 'Só com erro' },
];

export default function AparelhosScreen() {
  const { user } = useAuth();
  const { atualizarContagem } = useAlerts();
  const router = useRouter();

  const [dispositivos, setDispositivos] = useState<DispositivoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'Todos' | StatusDispositivo>('Todos');

  const carregar = useCallback(
    async (viaPullToRefresh = false) => {
      if (!user) return;
      viaPullToRefresh ? setAtualizando(true) : setCarregando(true);
      setErro(null);
      try {
        const resumo = await api.getResumo(user.uid);
        setDispositivos(resumo.dispositivos);
      } catch (err) {
        setErro('Não foi possível carregar seus aparelhos. Verifique sua conexão com a API.');
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

  useEffect(() => {
    const id = setInterval(() => carregar(), 20_000);
    return () => clearInterval(id);
  }, [carregar]);

  async function aoAdicionar() {
    await carregar();
    atualizarContagem();
  }

  const dispositivosFiltrados = useMemo(() => {
    return dispositivos.filter((d) => {
      const passaFiltro = filtro === 'Todos' || d.status === filtro;
      const passaBusca = !busca.trim() || d.nome.toLowerCase().includes(busca.trim().toLowerCase());
      return passaFiltro && passaBusca;
    });
  }, [dispositivos, filtro, busca]);

  return (
    <GradientScreen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Aparelhos</Text>
        <Pressable style={styles.addBotao} onPress={() => setModalVisivel(true)}>
          <Ionicons name="add" size={18} color="#04222B" />
          <Text style={styles.addBotaoTexto}>Adicionar</Text>
        </Pressable>
      </View>

      <SearchFilterBar
        busca={busca}
        onBuscaChange={setBusca}
        placeholderBusca="Buscar pelo nome..."
        opcoes={OPCOES_FILTRO}
        filtroSelecionado={filtro}
        onFiltroChange={(v) => setFiltro(v as 'Todos' | StatusDispositivo)}
      />

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.text.muted} />
          <Text style={styles.erroTexto}>{erro}</Text>
          <Pressable onPress={() => carregar()}>
            <Text style={styles.tentarNovamente}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={dispositivosFiltrados}
          keyExtractor={(item) => item.dispositivoId}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl tintColor={colors.accent} refreshing={atualizando} onRefresh={() => carregar(true)} />}
          renderItem={({ item }) => (
            <DeviceCard dispositivo={item} onPress={() => router.push(`/(app)/dispositivo/${item.dispositivoId}`)} />
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="hardware-chip-outline" size={44} color={colors.text.muted} />
              <Text style={styles.vazioTitulo}>{dispositivos.length === 0 ? 'Nenhum aparelho ainda' : 'Nada encontrado'}</Text>
              <Text style={styles.vazioTexto}>
                {dispositivos.length === 0
                  ? 'Toque em "Adicionar" e informe o ID do seu ESP32 ou leia o QR code.'
                  : 'Tente ajustar a busca ou o filtro selecionado.'}
              </Text>
            </View>
          }
        />
      )}

      <AddDeviceModal visible={modalVisivel} onClose={() => setModalVisivel(false)} onAdded={aoAdicionar} />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  titulo: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  addBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  addBotaoTexto: { color: '#04222B', fontWeight: '700', fontSize: 12 },
  lista: { paddingHorizontal: 20, paddingBottom: 120 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  erroTexto: { color: colors.text.secondary, textAlign: 'center', fontSize: 13 },
  tentarNovamente: { color: colors.accent, fontWeight: '700', fontSize: 13, marginTop: 4 },
  vazio: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 10 },
  vazioTitulo: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  vazioTexto: { color: colors.text.secondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
