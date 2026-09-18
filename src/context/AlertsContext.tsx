import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { api } from '../lib/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface AlertsContextValue {
  totalAlertasAtivos: number;
  popupVisivel: boolean;
  fecharPopup: () => void;
  irParaAlertas: () => void;
  atualizarContagem: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextValue | undefined>(undefined);

const INTERVALO_POLLING_MS = 30_000;

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { notificacoesAtivas } = usePreferences();
  const [totalAlertasAtivos, setTotalAlertasAtivos] = useState(0);
  const [popupVisivel, setPopupVisivel] = useState(false);
  const ultimoTotal = useRef(0);

  const atualizarContagem = useCallback(async () => {
    if (!user) return;
    try {
      const resumo = await api.getResumo(user.uid);
      setTotalAlertasAtivos(resumo.totalAlertasNaoResolvidos);
      // Se o total de alertas subiu desde a última checagem, mostra o popup
      // (cobre o caso do usuário estar com o app aberto quando o alerta surge).
      if (notificacoesAtivas && resumo.totalAlertasNaoResolvidos > ultimoTotal.current) {
        setPopupVisivel(true);
      }
      ultimoTotal.current = resumo.totalAlertasNaoResolvidos;
    } catch {
      // Falha de rede ao atualizar contagem — silenciosa, tenta de novo no próximo ciclo.
    }
  }, [user, notificacoesAtivas]);

  // Registro do push token + permissões, assim que o usuário loga (e enquanto
  // as notificações estiverem ativadas nas Configurações do app).
  useEffect(() => {
    if (!user || !notificacoesAtivas) return;
    let cancelado = false;

    (async () => {
      try {
        const { status: statusAtual } = await Notifications.getPermissionsAsync();
        let status = statusAtual;
        if (status !== 'granted') {
          const resp = await Notifications.requestPermissionsAsync();
          status = resp.status;
        }
        if (status !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('alertas', {
            name: 'Alertas de qualidade do ar',
            importance: Notifications.AndroidImportance.HIGH,
          });
        }

        const tokenResp = await Notifications.getExpoPushTokenAsync();
        if (!cancelado) {
          await api.registrarPushToken(user.uid, tokenResp.data);
        }
      } catch {
        // Sem Expo push disponível (ex.: emulador sem Google Play Services) — segue sem push.
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [user]);

  // Notificação chegou com o app aberto -> abre popup + atualiza contagem
  // (só se as notificações estiverem ativadas nas Configurações do app).
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      if (notificacoesAtivas) setPopupVisivel(true);
      atualizarContagem();
    });
    // Usuário tocou na notificação (app em background/fechado) -> vai direto pros alertas.
    const subResposta = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(app)/alertas');
    });
    return () => {
      sub.remove();
      subResposta.remove();
    };
  }, [atualizarContagem, notificacoesAtivas]);

  useEffect(() => {
    if (!user) {
      setTotalAlertasAtivos(0);
      return;
    }
    atualizarContagem();
    const id = setInterval(atualizarContagem, INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [user, atualizarContagem]);

  return (
    <AlertsContext.Provider
      value={{
        totalAlertasAtivos,
        popupVisivel,
        fecharPopup: () => setPopupVisivel(false),
        irParaAlertas: () => {
          setPopupVisivel(false);
          router.push('/(app)/alertas');
        },
        atualizarContagem,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts precisa estar dentro de <AlertsProvider>');
  return ctx;
}
