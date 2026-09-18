import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientScreen } from '../../../src/components/GradientScreen';
import { AlertCard } from '../../../src/components/AlertCard';
import { SearchFilterBar } from '../../../src/components/SearchFilterBar';
import { api } from '../../../src/lib/api';
import { useAlerts } from '../../../src/context/AlertsContext';
import { SENSORES } from '../../../src/constants/sensors';
import type { Alerta } from '../../../src/types';
import { colors } from '../../../src/theme/colors';

const OPCOES_TIPO = [
  { valor: 'Todos', label: 'Todos os tipos' },
  ...Object.entries(SENSORES).map(([tipo, meta]) => ({ valor: tipo, label: meta.label })),
];

export default function AlertasScreen() {
  const { atualizarContagem } = useAlerts();
  const [aba, setAba] = useState<'ativos' | 'dispensados'>('ativos');
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  const carregar = useCallback(
    async (viaPullToRefresh = false) => {
      viaPullToRefresh ? setAtualizando(true) : setCarregando(true);
      setErro(null);
      try {
        const resposta = await api.getAlertas(aba);
        setAlertas(resposta.alertas);
      } catch {
        setErro('Não foi possível carregar os alertas.');
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [aba]
  );

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function aoDispensar() {
    await carregar();
    atualizarContagem();
  }

  const alertasFiltrados = useMemo(() => {
    return alertas.filter((a) => {
      const passaTipo = tipoFiltro === 'Todos' || a.tipo === tipoFiltro;
      const passaBusca = !busca.trim() || a.nomeDispositivo.toLowerCase().includes(busca.trim().toLowerCase());
      return passaTipo && passaBusca;
    });
  }, [alertas, tipoFiltro, busca]);

  return (
    <GradientScreen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Alertas</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, aba === 'ativos' && styles.tabAtiva]} onPress={() => setAba('ativos')}>
          <Text style={[styles.tabLabel, aba === 'ativos' && styles.tabLabelAtiva]}>Ativos</Text>
        </Pressable>
        <Pressable style={[styles.tab, aba === 'dispensados' && styles.tabAtiva]} onPress={() => setAba('dispensados')}>
          <Text style={[styles.tabLabel, aba === 'dispensados' && styles.tabLabelAtiva]}>Dispensados</Text>
        </Pressable>
      </View>

      <SearchFilterBar
        busca={busca}
        onBuscaChange={setBusca}
        placeholderBusca="Buscar pelo aparelho..."
        opcoes={OPCOES_TIPO}
        filtroSelecionado={tipoFiltro}
        onFiltroChange={setTipoFiltro}
      />

      {aba === 'dispensados' ? <Text style={styles.avisoExpiracao}>Alertas dispensados são apagados automaticamente após 7 dias.</Text> : null}

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.erroTexto}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          data={alertasFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl tintColor={colors.accent} refreshing={atualizando} onRefresh={() => carregar(true)} />}
          renderItem={({ item }) => <AlertCard alerta={item} onDispensado={aoDispensar} />}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name={aba === 'ativos' ? 'shield-checkmark-outline' : 'archive-outline'} size={40} color={colors.text.muted} />
              <Text style={styles.vazioTexto}>
                {alertas.length === 0
                  ? aba === 'ativos'
                    ? 'Nenhum alerta ativo no momento.'
                    : 'Nenhum alerta dispensado ainda.'
                  : 'Nada encontrado com esses filtros.'}
              </Text>
            </View>
          }
        />
      )}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  titulo: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabAtiva: { backgroundColor: colors.accentSoft },
  tabLabel: { color: colors.text.secondary, fontWeight: '600', fontSize: 13 },
  tabLabelAtiva: { color: colors.accent },
  avisoExpiracao: { color: colors.text.muted, fontSize: 11, paddingHorizontal: 20, marginBottom: 10 },
  lista: { paddingHorizontal: 20, paddingBottom: 120 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  erroTexto: { color: colors.text.secondary, fontSize: 13 },
  vazio: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 40 },
  vazioTexto: { color: colors.text.secondary, fontSize: 13, textAlign: 'center' },
});
