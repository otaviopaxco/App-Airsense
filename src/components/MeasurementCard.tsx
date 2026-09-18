import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SENSORES, calcularPercentual, estaEmAlerta, type TipoSensor } from '../constants/sensors';
import { colors } from '../theme/colors';

interface Props {
  tipo: TipoSensor;
  valor: number;
  onPress: () => void;
}

export function MeasurementCard({ tipo, valor, onPress }: Props) {
  const meta = SENSORES[tipo];
  const percentual = calcularPercentual(tipo, valor);
  const emAlerta = estaEmAlerta(tipo, valor);
  const cor = emAlerta ? colors.status.Alerta : colors.accent;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.linhaTopo}>
        <View style={styles.iconeNome}>
          <Ionicons name={meta.icone} size={18} color={cor} />
          <Text style={styles.nome}>{meta.label}</Text>
        </View>
        {emAlerta ? (
          <View style={styles.tagAlerta}>
            <Text style={styles.tagAlertaTexto}>Alerta</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.valor, { color: cor }]}>
        {valor}
        <Text style={styles.unidade}> {meta.unidade}</Text>
      </Text>

      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${percentual}%`, backgroundColor: cor }]} />
      </View>
      <Text style={styles.percentualTexto}>{percentual}% da escala de referência</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconeNome: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nome: { color: colors.text.primary, fontWeight: '700', fontSize: 14 },
  tagAlerta: { backgroundColor: colors.statusSoft.Alerta, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tagAlertaTexto: { color: colors.status.Alerta, fontSize: 10, fontWeight: '800' },
  valor: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  unidade: { fontSize: 13, fontWeight: '500' },
  barraFundo: { height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 999 },
  percentualTexto: { color: colors.text.muted, fontSize: 11, marginTop: 6 },
});
