import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../context/AlertsContext';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

export function AlertPopup() {
  const { popupVisivel, fecharPopup, irParaAlertas, totalAlertasAtivos } = useAlerts();

  return (
    <Modal visible={popupVisivel} transparent animationType="fade" onRequestClose={fecharPopup}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconeCirculo}>
            <Ionicons name="warning-outline" size={28} color={colors.status.Alerta} />
          </View>
          <Text style={styles.titulo}>Novo alerta de qualidade do ar</Text>
          <Text style={styles.texto}>
            {totalAlertasAtivos > 1
              ? `Você tem ${totalAlertasAtivos} alertas ativos no momento.`
              : 'Um dos seus dispositivos detectou uma leitura fora do normal.'}
          </Text>
          <PrimaryButton label="Ver alertas" onPress={irParaAlertas} style={{ width: '100%', marginTop: 8 }} />
          <Pressable onPress={fecharPopup} style={{ marginTop: 12 }}>
            <Text style={styles.fechar}>Agora não</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(3,10,15,0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    backgroundColor: '#12222C',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.statusSoft.Alerta,
    padding: 24,
    alignItems: 'center',
  },
  iconeCirculo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.statusSoft.Alerta,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: { color: colors.text.primary, fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  texto: { color: colors.text.secondary, fontSize: 13, textAlign: 'center' },
  fechar: { color: colors.text.muted, fontSize: 13, fontWeight: '600' },
});
