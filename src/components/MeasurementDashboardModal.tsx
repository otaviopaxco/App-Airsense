import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from '../theme/colors';
import { SENSORES, calcularPercentual, estaEmAlerta, type TipoSensor } from '../constants/sensors';
import { api } from '../lib/api';
import type { Alerta, LeituraHoraria } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  dispositivoId: string;
  tipo: TipoSensor;
  valorAtual: number;
  ultimoAlerta?: Alerta;
}

const LARGURA_TELA = Dimensions.get('window').width;

const JANELAS = [
  { label: '12h', horas: 12 },
  { label: '1 dia', horas: 24 },
  { label: '3 dias', horas: 72 },
  { label: '7 dias', horas: 168 },
] as const;

export function MeasurementDashboardModal({ visible, onClose, dispositivoId, tipo, valorAtual, ultimoAlerta }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [pontos, setPontos] = useState<{ instante: string; valor: number }[]>([]);
  const [janela, setJanela] = useState<(typeof JANELAS)[number]>(JANELAS[3]);

  const meta = SENSORES[tipo];
  const percentual = calcularPercentual(tipo, valorAtual);
  const emAlerta = estaEmAlerta(tipo, valorAtual);

  useEffect(() => {
    if (!visible) return;
    let ativo = true;
    setCarregando(true);

    // Busca sempre os últimos 7 dias (o máximo que a API retém) e as
    // janelas menores (12h/1d/3d) são só um recorte no cliente — evita
    // refazer a chamada de rede a cada troca de botão.
    api
      .getLeiturasHorarias(dispositivoId, 7)
      .then((horarias: Record<string, LeituraHoraria>) => {
        if (!ativo) return;
        const lista = Object.entries(horarias)
          .filter(([, h]) => typeof h[tipo] === 'number' && typeof h.timestampInicio === 'string')
          .sort(([a], [b]) => a.localeCompare(b))
          // timestampInicio já vem em ISO com "Z" (UTC) — é isso que garante
          // que o `new Date(...)` seja interpretado corretamente e, ao
          // formatar, o date-fns mostre automaticamente no fuso local do
          // aparelho. Reconstruir a partir da chave "hourKey" (sem "Z")
          // fazia o JS ler a hora UTC como se já fosse hora local, o que
          // deslocava todo o gráfico pelo fuso horário do usuário.
          .map(([, h]) => ({ instante: h.timestampInicio as string, valor: h[tipo] as number }));
        setPontos(lista);
      })
      .catch(() => setPontos([]))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [visible, dispositivoId, tipo]);

  const amostraGrafico = pontos.slice(-janela.horas);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIconeNome}>
              <View style={[styles.iconeCirculo, { backgroundColor: emAlerta ? colors.statusSoft.Alerta : colors.accentSoft }]}>
                <Ionicons name={meta.icone} size={20} color={emAlerta ? colors.status.Alerta : colors.accent} />
              </View>
              <Text style={styles.titulo}>{meta.label}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.resumoLinha}>
              <View>
                <Text style={styles.valorAtual}>
                  {valorAtual} <Text style={styles.unidade}>{meta.unidade}</Text>
                </Text>
                <Text style={styles.percentualTexto}>{percentual}% da escala de referência</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: emAlerta ? colors.statusSoft.Alerta : colors.statusSoft.Ativo }]}>
                <Text style={{ color: emAlerta ? colors.status.Alerta : colors.status.Ativo, fontWeight: '700', fontSize: 12 }}>
                  {emAlerta ? 'Em alerta' : 'Normal'}
                </Text>
              </View>
            </View>

            <View style={styles.seletorDias}>
              {JANELAS.map((opcao) => (
                <Pressable
                  key={opcao.label}
                  onPress={() => setJanela(opcao)}
                  style={[styles.diasBotao, janela.label === opcao.label && styles.diasBotaoAtivo]}
                >
                  <Text style={[styles.diasTexto, janela.label === opcao.label && styles.diasTextoAtivo]}>{opcao.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.secaoTitulo}>Histórico (médias horárias)</Text>
            {carregando ? (
              <View style={styles.carregandoBox}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : amostraGrafico.length >= 2 ? (
              <LineChart
                data={{
                  labels: amostraGrafico
                    .filter((_, i) => i % Math.ceil(amostraGrafico.length / 6) === 0)
                    .map((p) => format(new Date(p.instante), janela.horas > 24 ? 'dd/MM HH:mm' : 'HH:mm', { locale: ptBR })),
                  datasets: [{ data: amostraGrafico.map((p) => p.valor) }],
                }}
                width={LARGURA_TELA - 72}
                height={190}
                withInnerLines={false}
                withOuterLines={false}
                withShadow={false}
                chartConfig={{
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  color: () => colors.accent,
                  labelColor: () => colors.text.muted,
                  decimalPlaces: 0,
                  propsForDots: { r: '2' },
                }}
                bezier
                style={{ marginLeft: -16 }}
              />
            ) : (
              <Text style={styles.semDados}>Ainda não há dados horários suficientes para desenhar o gráfico.</Text>
            )}

            <Text style={styles.secaoTitulo}>Último alerta</Text>
            {ultimoAlerta ? (
              <View style={styles.alertaBox}>
                <Text style={styles.alertaTexto}>
                  {ultimoAlerta.valorMedido} {meta.unidade} em{' '}
                  {format(new Date(ultimoAlerta.horario), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </Text>
                <Text style={styles.alertaSub}>{ultimoAlerta.resolvido ? 'Dispensado' : 'Ainda ativo'}</Text>
              </View>
            ) : (
              <Text style={styles.semDados}>Nenhum alerta registrado para este sensor.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(3,10,15,0.75)', justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#0E2230',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    maxHeight: '82%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerIconeNome: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconeCirculo: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titulo: { color: colors.text.primary, fontSize: 17, fontWeight: '700' },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  valorAtual: { color: colors.text.primary, fontSize: 30, fontWeight: '800' },
  unidade: { fontSize: 14, fontWeight: '500', color: colors.text.secondary },
  percentualTexto: { color: colors.text.muted, fontSize: 12, marginTop: 4 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  seletorDias: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  diasBotao: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  diasBotaoAtivo: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  diasTexto: { color: colors.text.secondary, fontSize: 12, fontWeight: '600' },
  diasTextoAtivo: { color: colors.accent },
  secaoTitulo: { color: colors.text.secondary, fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  carregandoBox: { height: 190, alignItems: 'center', justifyContent: 'center' },
  semDados: { color: colors.text.muted, fontSize: 13 },
  alertaBox: { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.cardBorder },
  alertaTexto: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  alertaSub: { color: colors.text.muted, fontSize: 12, marginTop: 4 },
});
