import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StatusDispositivo } from '../types';
import { colors } from '../theme/colors';

const ICONE: Record<StatusDispositivo, string> = {
  Ativo: '●',
  Offline: '○',
  Alerta: '▲',
  Erro: '✕',
};

export function StatusPill({ status, size = 'md' }: { status: StatusDispositivo; size?: 'sm' | 'md' }) {
  const cor = colors.status[status];
  const fundo = colors.statusSoft[status];
  const pequeno = size === 'sm';

  return (
    <View style={[styles.container, { backgroundColor: fundo }, pequeno && styles.containerSm]}>
      <Text style={[styles.dot, { color: cor }, pequeno && styles.dotSm]}>{ICONE[status]}</Text>
      <Text style={[styles.label, { color: cor }, pequeno && styles.labelSm]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  containerSm: { paddingHorizontal: 8, paddingVertical: 3 },
  dot: { fontSize: 10, marginRight: 5 },
  dotSm: { fontSize: 8, marginRight: 4 },
  label: { fontSize: 12, fontWeight: '700' },
  labelSm: { fontSize: 10 },
});
