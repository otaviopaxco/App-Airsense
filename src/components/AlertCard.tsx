import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Alerta } from '../types';
import { SENSORES, calcularPercentual } from '../constants/sensors';
import { colors } from '../theme/colors';
import { api, ApiError } from '../lib/api';

export function AlertCard({ alerta, onDispensado }: { alerta: Alerta; onDispensado: () => void }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const meta = SENSORES[alerta.tipo];
  const percentual = meta ? calcularPercentual(alerta.tipo, alerta.valorMedido) : 0;
  const excedente = alerta.limite ? Math.round(((alerta.valorMedido - alerta.limite) / alerta.limite) * 100) : null;

  async function dispensar() {
    setCarregando(true);
    setErro(null);
    try {
      await api.dispensarAlerta(alerta.id);
      onDispensado();
    } catch (err) {
      if (err instanceof ApiError) {
        // Em 409 (alerta ainda ativo), a API manda o motivo específico em
        // `detalhes` (ver ApiError em lib/api.ts) — mais útil pro usuário
        // do que o texto genérico "Alerta ainda ativo.".
        const motivo = typeof err.detalhes === 'string' ? err.detalhes : null;
        setErro(motivo || err.message);
      } else {
        setErro('Falha ao dispensar.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[styles.card, alerta.resolvido && styles.cardDispensado]}>
      <View style={styles.linhaTopo}>
        <View style={[styles.iconeCirculo, { backgroundColor: alerta.resolvido ? colors.card : colors.statusSoft.Alerta }]}>
          <Ionicons name={meta?.icone || 'alert-circle-outline'} size={18} color={alerta.resolvido ? colors.text.muted : colors.status.Alerta} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dispositivo}>{alerta.nomeDispositivo}</Text>
          <Text style={styles.descricao}>
            {meta?.label || alerta.tipo}: {alerta.valorMedido} {meta?.unidade}
            {excedente !== null ? ` (${excedente > 0 ? '+' : ''}${excedente}% do limite)` : ''}
          </Text>
        </View>
        <Text style={styles.percentual}>{percentual}%</Text>
      </View>

      <Text style={styles.horario}>{format(new Date(alerta.horario), "dd/MM 'às' HH:mm", { locale: ptBR })}</Text>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {!alerta.resolvido ? (
        <Pressable onPress={dispensar} disabled={carregando} style={styles.botaoDispensar}>
          {carregando ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={styles.botaoDispensarTexto}>Dispensar</Text>}
        </Pressable>
      ) : (
        <View style={styles.tagDispensado}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.text.muted} />
          <Text style={styles.tagDispensadoTexto}>Dispensado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.statusSoft.Alerta,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  cardDispensado: { borderColor: colors.cardBorder, opacity: 0.7 },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconeCirculo: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dispositivo: { color: colors.text.primary, fontWeight: '700', fontSize: 14 },
  descricao: { color: colors.text.secondary, fontSize: 12, marginTop: 2 },
  percentual: { color: colors.status.Alerta, fontWeight: '800', fontSize: 14 },
  horario: { color: colors.text.muted, fontSize: 11, marginTop: 8, marginLeft: 46 },
  erro: { color: colors.danger, fontSize: 12, marginTop: 8, marginLeft: 46 },
  botaoDispensar: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 46,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  botaoDispensarTexto: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  tagDispensado: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, marginLeft: 46 },
  tagDispensadoTexto: { color: colors.text.muted, fontSize: 11 },
});
