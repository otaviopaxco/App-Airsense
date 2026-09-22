import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TextField } from './TextField';
import { PrimaryButton } from './PrimaryButton';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddDeviceModal({ visible, onClose, onAdded }: Props) {
  const { user } = useAuth();
  const [modo, setModo] = useState<'texto' | 'camera'>('texto');
  const [idDigitado, setIdDigitado] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [jaLido, setJaLido] = useState(false);

  useEffect(() => {
    if (visible) {
      setJaLido(false);
      setErro(null);
    }
  }, [visible]);

  async function vincular(id: string) {
    if (!user || !id.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      await api.vincularDispositivo(id.trim(), user.uid);
      setIdDigitado('');
      setJaLido(false);
      onAdded();
      onClose();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível adicionar o dispositivo.');
      setJaLido(false); // permite tentar escanear de novo sem fechar o modal
    } finally {
      setCarregando(false);
    }
  }

  function abrirCamera() {
    setErro(null);
    setJaLido(false);
    setModo('camera');
    if (!permissao?.granted) solicitarPermissao();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar aparelho</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </Pressable>
          </View>

          <View style={styles.tabs}>
            <Pressable style={[styles.tab, modo === 'texto' && styles.tabAtiva]} onPress={() => setModo('texto')}>
              <Text style={[styles.tabLabel, modo === 'texto' && styles.tabLabelAtiva]}>Digitar ID</Text>
            </Pressable>
            <Pressable style={[styles.tab, modo === 'camera' && styles.tabAtiva]} onPress={abrirCamera}>
              <Text style={[styles.tabLabel, modo === 'camera' && styles.tabLabelAtiva]}>Ler QR code</Text>
            </Pressable>
          </View>

          {modo === 'texto' ? (
            <View style={styles.conteudo}>
              <TextField
                label="ID do ESP32"
                placeholder="ex.: esp-a1b2c3"
                icon="hardware-chip-outline"
                autoCapitalize="none"
                value={idDigitado}
                onChangeText={setIdDigitado}
              />
              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
              <PrimaryButton
                label="Adicionar"
                loading={carregando}
                disabled={!idDigitado.trim()}
                onPress={() => vincular(idDigitado)}
              />
            </View>
          ) : (
            <View style={styles.conteudo}>
              {!permissao?.granted ? (
                <View style={styles.semPermissao}>
                  <Ionicons name="camera-outline" size={32} color={colors.text.muted} />
                  <Text style={styles.semPermissaoTexto}>
                    Precisamos da câmera para ler o QR code do aparelho.
                  </Text>
                  <PrimaryButton label="Permitir câmera" onPress={solicitarPermissao} style={{ width: '100%' }} />
                </View>
              ) : (
                <View style={styles.cameraBox}>
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={
                      jaLido
                        ? undefined
                        : ({ data }) => {
                            setJaLido(true);
                            vincular(data.trim());
                          }
                    }
                  />
                  <View style={styles.mira} />
                  {carregando ? <Text style={styles.lendo}>Verificando ID...</Text> : null}
                </View>
              )}
              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(3,10,15,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0E2230',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorderStrong,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabAtiva: { backgroundColor: colors.accentSoft },
  tabLabel: { color: colors.text.secondary, fontWeight: '600', fontSize: 13 },
  tabLabelAtiva: { color: colors.accent },
  conteudo: { minHeight: 180 },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  cameraBox: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mira: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  lendo: {
    position: 'absolute',
    bottom: 12,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  semPermissao: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  semPermissaoTexto: { color: colors.text.secondary, textAlign: 'center', fontSize: 13 },
});
