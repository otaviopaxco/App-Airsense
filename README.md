# AirSense — App (Expo / React Native)

<img width="1080" height="608" alt="AirSenseIndustria" src="https://github.com/user-attachments/assets/eafe7747-24eb-4ba5-b2de-a78c09b5857d" />

Protótipo funcional do app que consome a API `API-Air-Sense`. Foco em funcionalidade e integração real com a API e Firebase Auth.

## Stack

- **Expo Router** (navegação por arquivos, grupos `(auth)` e `(app)`)
- **Firebase Authentication** — login/cadastro/redefinição de senha
- **expo-camera** — leitura de QR code na tela de adicionar aparelho
- **expo-notifications** — push notification quando um alerta é gerado
- **react-native-chart-kit** — gráfico de dias no dashboard da medição
- **expo-secure-store** — nada de sensível é salvo

`Como o app ainda está em fase de produção e ainda precisa necessariamente do simulador Expo Go, não serão deixados os detalhes de como construir o projeto do zero pois depende da API e Firebase Auth, também há de lembrar que o .env do projeto contém informações sensíveis.`
