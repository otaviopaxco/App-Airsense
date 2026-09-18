import type { TipoSensor } from './constants/sensors';

export type StatusDispositivo = 'Ativo' | 'Offline' | 'Alerta' | 'Erro';

export interface UltimaLeitura {
  valor: number;
  horario: string;
}

export interface DispositivoResumo {
  dispositivoId: string;
  nome: string;
  modelo: string;
  ativo: boolean;
  online: boolean;
  status: StatusDispositivo;
  descricaoStatus: string;
  ultimoContato: string | null;
  ultimaLeitura: Partial<Record<TipoSensor, UltimaLeitura>>;
  alertasNaoResolvidos: number;
}

export interface ResumoResponse {
  geradoEm: string;
  totalDispositivos: number;
  dispositivosOnline: number;
  totalAlertasNaoResolvidos: number;
  contagemPorStatus: Record<StatusDispositivo, number>;
  dispositivos: DispositivoResumo[];
}

export interface LeituraHoraria {
  amostras: number;
  timestampInicio: string;
  timestampFim: string;
  [tipo: string]: number | string;
}

export interface Alerta {
  id: string;
  dispositivoId: string;
  nomeDispositivo: string;
  tipo: TipoSensor;
  valorMedido: number;
  limite: number | null;
  descricao: string;
  risco: number;
  horario: string;
  resolvido: boolean;
  resolvidoEm?: string;
}

export interface AlertasResponse {
  total: number;
  alertas: Alerta[];
}
