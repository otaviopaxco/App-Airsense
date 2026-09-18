import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { GradientScreen } from '../../../src/components/GradientScreen';
import { StatusPill } from '../../../src/components/StatusPill';
import { MeasurementCard } from '../../../src/components/MeasurementCard';
import { MeasurementDashboardModal } from '../../../src/components/MeasurementDashboardModal';
import { useAuth } from '../../../src/context/AuthContext';
import { api, ApiError } from '../../../src/lib/api';
import { SENSORES, type TipoSensor } from '../../../src/constants/sensors';
import type { Alerta } from '../../../src/types';
import { colors } from '../../../src/theme/colors';

export default function DispositivoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [dispositivo, setDispositivo] = useState<any>(null);
  const [alertasDoDispositivo, setAlertasDoDispositivo] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeRascunho, setNomeRascunho] = useState('');
  const [salvandoNome, setSalvandoNome] = useState(false);

  const [copiado, setCopiado] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  const [sensorSelecionado, setSensorSelecionado] = useState<TipoSensor | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    setErro(null);
    try {
      const [dados, alertasResp] = await Promise.all([api.getDispositivo(id), api.getAlertas(undefined, id)]);
      setDispositivo(dados);
      setAlertasDoDispositivo(alertasResp.alertas);
      setNomeRascunho(dados.nome);
    } catch (err) {
      setErro('Não foi possível carregar este dispositivo.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    const intervalo = setInterval(carregar, 20_000);
    return () => clearInterval(intervalo);
  }, [carregar]);

  async function salvarNome() {
    if (!nomeRascunho.trim() || !id) return;
    setSalvandoNome(true);
    try {
      await api.renomearDispositivo(id, nomeRascunho.trim());
      setDispositivo((atual: any) => ({ ...atual, nome: nomeRascunho.trim() }));
      setEditandoNome(false);
    } catch (err) {
      Alert.alert('Erro', err instanceof ApiError ? err.message : 'Não foi possível renomear.');
    } finally {
      setSalvandoNome(false);
    }
  }

  async function copiarId() {
    if (!id) return;
    await Clipboard.setStringAsync(id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  function confirmarRemocao() {
    Alert.alert('Remover aparelho', 'Ele será removido da sua lista. O histórico e o hardware não são afetados.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: remover },
    ]);
  }

  async function remover() {
    if (!user || !id) return;
    setRemovendo(true);
    try {
      await api.desvincularDispositivo(id, user.uid);
      router.back();
    } catch (err) {
      Alert.alert('Erro', err instanceof ApiError ? err.message : 'Não foi possível remover.');
      setRemovendo(false);
    }
  }

  if (carregando) {
    return (
      <GradientScreen edges={['top']}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </GradientScreen>
    );
  }

  if (erro || !dispositivo) {
    return (
      <GradientScreen edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.centro}>
          <Text style={styles.erroTexto}>{erro || 'Dispositivo não encontrado.'}</Text>
        </View>
      </GradientScreen>
    );
  }

  const leituras: Record<string, { valor: number; horario: string }> = dispositivo.ultimaLeitura || {};
  const tiposComLeitura = Object.keys(SENSORES).filter((tipo) => leituras[tipo] !== undefined) as TipoSensor[];

  return (
    <GradientScreen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Pressable onPress={confirmarRemocao} disabled={removendo} hitSlop={10}>
          {removendo ? <ActivityIndicator color={colors.danger} size="small" /> : <Ionicons name="trash-outline" size={22} color={colors.danger} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <View style={[styles.iconeCirculo, { backgroundColor: colors.statusSoft[dispositivo.status as keyof typeof colors.statusSoft] }]}>
            <Ionicons name="hardware-chip-outline" size={34} color={colors.status[dispositivo.status as keyof typeof colors.status]} />
          </View>

          {editandoNome ? (
            <View style={styles.editarNomeLinha}>
              <TextInput
                value={nomeRascunho}
                onChangeText={setNomeRascunho}
                style={styles.inputNome}
                autoFocus
                maxLength={60}
                placeholderTextColor={colors.text.muted}
              />
              <Pressable onPress={salvarNome} disabled={salvandoNome} style={styles.botaoSalvarNome}>
                {salvandoNome ? <ActivityIndicator size="small" color="#04222B" /> : <Ionicons name="checkmark" size={18} color="#04222B" />}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.nomeLinha} onPress={() => setEditandoNome(true)}>
              <Text style={styles.nome}>{dispositivo.nome}</Text>
              <Ionicons name="pencil-outline" size={16} color={colors.text.muted} />
            </Pressable>
          )}

          <Pressable style={styles.idLinha} onPress={copiarId}>
            <Text style={styles.idTexto}>{dispositivo.dispositivoId}</Text>
            <Ionicons name={copiado ? 'checkmark' : 'copy-outline'} size={14} color={copiado ? colors.success : colors.text.muted} />
          </Pressable>

          <View style={{ marginTop: 10 }}>
            <StatusPill status={dispositivo.status} />
          </View>
        </View>

        {dispositivo.status === 'Erro' || dispositivo.status === 'Offline' ? (
          <View style={styles.avisoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.status[dispositivo.status as 'Erro' | 'Offline']} />
            <Text style={[styles.avisoTexto, { color: colors.status[dispositivo.status as 'Erro' | 'Offline'] }]}>
              {dispositivo.descricaoStatus}
            </Text>
          </View>
        ) : null}

        <Text style={styles.secaoTitulo}>Medições</Text>
        {tiposComLeitura.length === 0 ? (
          <Text style={styles.semDados}>Nenhuma leitura recebida deste dispositivo ainda.</Text>
        ) : (
          tiposComLeitura.map((tipo) => (
            <MeasurementCard key={tipo} tipo={tipo} valor={leituras[tipo].valor} onPress={() => setSensorSelecionado(tipo)} />
          ))
        )}
      </ScrollView>

      {sensorSelecionado ? (
        <MeasurementDashboardModal
          visible={!!sensorSelecionado}
          onClose={() => setSensorSelecionado(null)}
          dispositivoId={dispositivo.dispositivoId}
          tipo={sensorSelecionado}
          valorAtual={leituras[sensorSelecionado]?.valor ?? 0}
          ultimoAlerta={alertasDoDispositivo.filter((a) => a.tipo === sensorSelecionado).sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime())[0]}
        />
      ) : null}
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
    paddingBottom: 12,
  },
  conteudo: { paddingHorizontal: 20, paddingBottom: 60 },
  topo: { alignItems: 'center', marginBottom: 18 },
  iconeCirculo: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nome: { color: colors.text.primary, fontSize: 20, fontWeight: '800' },
  editarNomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', paddingHorizontal: 20 },
  inputNome: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 4,
    textAlign: 'center',
  },
  botaoSalvarNome: { backgroundColor: colors.accent, width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  idLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  idTexto: { color: colors.text.muted, fontSize: 12 },
  avisoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  avisoTexto: { flex: 1, fontSize: 12, lineHeight: 18 },
  secaoTitulo: { color: colors.text.secondary, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  semDados: { color: colors.text.muted, fontSize: 13 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  erroTexto: { color: colors.text.secondary, fontSize: 13, paddingHorizontal: 30, textAlign: 'center' },
});
