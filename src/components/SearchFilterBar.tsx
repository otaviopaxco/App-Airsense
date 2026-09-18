import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Opcao {
  valor: string;
  label: string;
}

interface Props {
  busca: string;
  onBuscaChange: (v: string) => void;
  placeholderBusca: string;
  opcoes: Opcao[];
  filtroSelecionado: string;
  onFiltroChange: (v: string) => void;
}

export function SearchFilterBar({ busca, onBuscaChange, placeholderBusca, opcoes, filtroSelecionado, onFiltroChange }: Props) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const labelSelecionado = opcoes.find((o) => o.valor === filtroSelecionado)?.label ?? opcoes[0]?.label;

  return (
    <View style={styles.container}>
      <View style={styles.buscaBox}>
        <Ionicons name="search-outline" size={16} color={colors.text.muted} />
        <TextInput
          value={busca}
          onChangeText={onBuscaChange}
          placeholder={placeholderBusca}
          placeholderTextColor={colors.text.muted}
          style={styles.buscaInput}
          autoCapitalize="none"
        />
        {busca ? (
          <Pressable onPress={() => onBuscaChange('')} hitSlop={10}>
            <Ionicons name="close-circle" size={16} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>

      <Pressable style={styles.filtroBox} onPress={() => setDropdownAberto(true)}>
        <Text style={styles.filtroTexto}>{labelSelecionado}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.accent} />
      </Pressable>

      <Modal visible={dropdownAberto} transparent animationType="fade" onRequestClose={() => setDropdownAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDropdownAberto(false)}>
          <View style={styles.dropdown}>
            {opcoes.map((opcao) => (
              <Pressable
                key={opcao.valor}
                style={[styles.opcao, filtroSelecionado === opcao.valor && styles.opcaoAtiva]}
                onPress={() => {
                  onFiltroChange(opcao.valor);
                  setDropdownAberto(false);
                }}
              >
                <Text style={[styles.opcaoTexto, filtroSelecionado === opcao.valor && styles.opcaoTextoAtivo]}>{opcao.label}</Text>
                {filtroSelecionado === opcao.valor ? <Ionicons name="checkmark" size={16} color={colors.accent} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  buscaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  buscaInput: { flex: 1, color: colors.text.primary, fontSize: 13 },
  filtroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  filtroTexto: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(3,10,15,0.6)', justifyContent: 'center', padding: 30 },
  dropdown: { backgroundColor: '#0E2230', borderRadius: 18, borderWidth: 1, borderColor: colors.cardBorder, padding: 8 },
  opcao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  opcaoAtiva: { backgroundColor: colors.accentSoft },
  opcaoTexto: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  opcaoTextoAtivo: { color: colors.accent },
});
