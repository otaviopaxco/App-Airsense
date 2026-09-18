import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View style={styles.container}>
        <Text style={styles.titulo}>Esta tela não existe.</Text>
        <Link href="/(app)" style={styles.link}>
          Voltar para o início
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.bg.top },
  titulo: { color: colors.text.primary, fontSize: 16, marginBottom: 12 },
  link: { color: colors.accent, fontWeight: '700' },
});
