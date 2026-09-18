# AirSense — App (Expo / React Native)

Protótipo funcional do app que consome a API `API-Air-Sense`. Foco em
funcionalidade e integração real com a API + Firebase Auth — o visual é
inspirado na referência enviada (navy + gradiente ciano), mas com mais
profundidade (glass cards, gradientes por status, glow decorativo).

## Stack

- **Expo Router** (navegação por arquivos, grupos `(auth)` e `(app)`)
- **Firebase Authentication** — só para login/cadastro/redefinição de senha
  (o app nunca fala direto com o Realtime Database — só com a API)
- **expo-camera** — leitura de QR code na tela de adicionar aparelho
- **expo-notifications** — push notification quando um alerta é gerado
- **react-native-chart-kit** — gráfico de 7/14 dias no dashboard da medição
- **expo-secure-store** — nada de sensível é salvo aqui hoje (a sessão fica
  a cargo do próprio Firebase Auth), mas o wrapper já está pronto para uso
  futuro (ex.: cache de preferências).

## 1. Configurar o Firebase Authentication

1. No [console do Firebase](https://console.firebase.google.com), no mesmo
   projeto usado pela API, vá em **Authentication → Sign-in method** e
   habilite o provedor **E-mail/senha**.
2. Em **Project settings → Seus apps**, crie (ou reaproveite) um app **Web**
   e copie `apiKey`, `authDomain`, `projectId` e `appId`.
3. Em **Authentication → Templates**, você pode customizar o e-mail de
   redefinição de senha (idioma, remetente, etc.) — o Firebase já cuida do
   envio, não precisa de servidor de e-mail próprio.

## 2. Configurar o `.env`

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO:3000/api
EXPO_PUBLIC_APP_API_KEY=            # o mesmo valor de APP_API_KEY no .env da API
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

> Testando no celular físico via Expo Go: `EXPO_PUBLIC_API_URL` precisa ser
> um IP acessível pela rede (não `localhost`) — ex. o IP local do seu
> computador na mesma Wi-Fi (`http://192.168.0.10:3000/api`), ou a URL
> pública se você já publicou a API (Render, Railway etc.).

## 3. Instalar e rodar

```bash
npm install
npx expo install --fix   # alinha as versões nativas com o SDK do Expo instalado
npx expo start
```

- Escaneie o QR code com o app **Expo Go** (Android/iOS) — mais rápido pra
  testar, mas câmera/QR e push funcionam melhor em **build de
  desenvolvimento** (`npx expo run:android` / `npx expo run:ios` ou EAS Build),
  já que o Expo Go tem limitações com push notifications em alguns casos.
- Notificações push **não funcionam em emulador Android sem Google Play
  Services** nem no simulador iOS — teste em aparelho físico.

## 4. Fluxo ponta a ponta para testar tudo

1. Crie uma conta (Cadastro) → confirma no Firebase Auth.
2. Na API, provisione um dispositivo de teste:
   ```bash
   curl -X POST http://localhost:3000/api/admin/dispositivos \
     -H "X-Admin-Key: SEU_ADMIN_KEY" -H "Content-Type: application/json" \
     -d '{"id":"esp-teste-01","modelo":"ESP32-AirSense-v1"}'
   ```
3. No app, toque em **Adicionar aparelho** → digite `esp-teste-01` (ou gere
   um QR code com esse texto para testar a câmera).
4. Simule uma leitura acima do limite (dispara alerta + push):
   ```bash
   curl -X POST http://localhost:3000/api/leituras \
     -H "X-Device-Key: A_CHAVE_RETORNADA_NO_PASSO_2" -H "Content-Type: application/json" \
     -d '{"dispositivoId":"esp-teste-01","tipo":"CO2","valor":6000}'
   ```
5. O card do aparelho fica **Alerta** (amarelo), a aba **Alertas** ganha um
   badge, e — se o push token já foi registrado — chega uma notificação.
6. Envie mais 5 leituras de CO2 abaixo de 5000 para poder **Dispensar** o
   alerta na tela de Alertas.

## Simplificações assumidas neste protótipo

- **Single-tenant leve**: se um usuário ainda não vinculou nenhum
  dispositivo, `/api/resumo` mostra todos os dispositivos existentes (útil
  pra não começar com tela vazia num ambiente de testes/uma única empresa).
  Depois que o primeiro vínculo é feito, só os vinculados aparecem.
- **Renomear é cosmético**: não afeta o firmware nem a autenticação do ESP32.
- **Lixeira = desvincular**, não apaga o histórico nem o hardware.
