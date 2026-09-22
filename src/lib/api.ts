import type { AlertasResponse, LeituraHoraria, ResumoResponse } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const APP_KEY = process.env.EXPO_PUBLIC_APP_API_KEY ?? '';

export class ApiError extends Error {
  status: number;
  detalhes?: unknown;
  constructor(status: number, message: string, detalhes?: unknown) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Key': APP_KEY,
      ...(options.headers || {}),
    },
  });

  let corpo: any = null;
  try {
    corpo = await resposta.json();
  } catch {
    // resposta sem corpo (ex.: 204)
  }

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      corpo?.erro || `Falha na requisição (HTTP ${resposta.status}).`,
      corpo?.detalhes || corpo?.motivo
    );
  }

  return corpo as T;
}

export const api = {
  // --- Dispositivos ---
  getResumo: (usuarioId?: string) =>
    request<ResumoResponse>(`/resumo${usuarioId ? `?usuarioId=${encodeURIComponent(usuarioId)}` : ''}`),

  getDispositivo: (id: string) => request<any>(`/dispositivos/${encodeURIComponent(id)}`),

  getLeiturasHorarias: (id: string, dias = 7) =>
    request<Record<string, LeituraHoraria>>(`/leituras/${encodeURIComponent(id)}/horarias?dias=${dias}`),

  renomearDispositivo: (id: string, nome: string) =>
    request<{ ok: true }>(`/dispositivos/${encodeURIComponent(id)}/nome`, {
      method: 'PATCH',
      body: JSON.stringify({ nome }),
    }),

  vincularDispositivo: (id: string, usuarioId: string) =>
    request<{ ok: true; dispositivo: any }>(`/dispositivos/${encodeURIComponent(id)}/vincular`, {
      method: 'POST',
      body: JSON.stringify({ usuarioId }),
    }),

  desvincularDispositivo: (id: string, usuarioId: string) =>
    request<{ ok: true }>(`/dispositivos/${encodeURIComponent(id)}/vincular`, {
      method: 'DELETE',
      body: JSON.stringify({ usuarioId }),
    }),

  // --- Alertas ---
  getAlertas: (usuarioId: string, status?: 'ativos' | 'dispensados', dispositivoId?: string) => {
    const params = new URLSearchParams({ usuarioId });
    if (status) params.set('status', status);
    if (dispositivoId) params.set('dispositivoId', dispositivoId);
    return request<AlertasResponse>(`/alertas/lista?${params.toString()}`);
  },

  dispensarAlerta: (id: string) =>
    request<{ ok: true }>(`/alertas/${encodeURIComponent(id)}/dispensar`, { method: 'POST' }),

  // --- Push ---
  registrarPushToken: (usuarioId: string, token: string) =>
    request<{ ok: true }>(`/usuarios/${encodeURIComponent(usuarioId)}/push-token`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  removerPushToken: (usuarioId: string, token: string) =>
    request<{ ok: true }>(`/usuarios/${encodeURIComponent(usuarioId)}/push-token`, {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    }),
};
