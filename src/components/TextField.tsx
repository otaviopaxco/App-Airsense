import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
}

export function TextField({ label, icon, isPassword, error, style, ...rest }: Props) {
  const [escondida, setEscondida] = useState(!!isPassword);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, error && styles.containerError]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.text.muted} style={styles.icon} /> : null}
        <TextInput
          placeholderTextColor={colors.text.muted}
          secureTextEntry={escondida}
          style={[styles.input, style]}
          {...rest}
        />
        {isPassword ? (
          <Pressable onPress={() => setEscondida((v) => !v)} hitSlop={10}>
            <Ionicons name={escondida ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { color: colors.text.secondary, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  containerError: { borderColor: colors.danger },
  icon: { marginRight: 8 },
  input: { flex: 1, color: colors.text.primary, fontSize: 15 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 6 },
});
