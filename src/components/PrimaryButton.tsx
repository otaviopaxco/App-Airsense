import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const isDisabled = disabled || loading;

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.ghost, isDisabled && styles.disabled, style]}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.danger, isDisabled && styles.disabled, style]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerLabel}>{label}</Text>}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={[style, isDisabled && styles.disabled]}>
      <LinearGradient colors={colors.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}>
        {loading ? <ActivityIndicator color="#04222B" /> : <Text style={styles.primaryLabel}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: '#04222B', fontSize: 16, fontWeight: '700' },
  ghost: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderStrong,
    backgroundColor: colors.card,
  },
  ghostLabel: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  danger: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  dangerLabel: { color: colors.danger, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
