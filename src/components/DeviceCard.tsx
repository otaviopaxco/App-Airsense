import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DispositivoResumo } from '../types';
import { colors } from '../theme/colors';
import { StatusPill } from './StatusPill';

export function DeviceCard({ dispositivo, onPress }: { dispositivo: DispositivoResumo; onPress: () => void }) {
  const ultimoContatoTexto = dispositivo.ultimoContato
    ? formatDistanceToNow(new Date(dispositivo.ultimoContato), { addSuffix: true, locale: ptBR })
    : 'nunca';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <View style={[styles.card, { borderColor: colors.status[dispositivo.status] + '55' }]}>
        <LinearGradient
          colors={[colors.status[dispositivo.status] + '22', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.iconCircle, { backgroundColor: colors.statusSoft[dispositivo.status] }]}>
          <Ionicons name="hardware-chip-outline" size={26} color={colors.status[dispositivo.status]} />
        </View>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>
            {dispositivo.nome}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {dispositivo.online ? `Visto ${ultimoContatoTexto}` : `Offline · visto ${ultimoContatoTexto}`}
          </Text>
        </View>

        <View style={styles.direita}>
          <StatusPill status={dispositivo.status} />
          {dispositivo.alertasNaoResolvidos > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{dispositivo.alertasNaoResolvidos}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  nome: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meta: { color: colors.text.secondary, fontSize: 12 },
  direita: { alignItems: 'flex-end', gap: 6, marginRight: 4 },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#2A0A0A', fontSize: 11, fontWeight: '800' },
});
