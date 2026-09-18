import type { Ionicons } from '@expo/vector-icons';

export type TipoSensor = 'CO2' | 'CH4' | 'VOC' | 'Temperatura' | 'Umidade';

type IconName = keyof typeof Ionicons.glyphMap;

interface SensorMeta {
  label: string;
  unidade: string;
  icone: IconName;
  // Mesmos limiares de src/services/firebaseService.js na API — mantenha em
  // sincronia se ajustar um dos dois lados.
  limite: number;
  // Valor de referência "cheio" só para desenhar a barra de progresso (0–100%),
  // não é um limite de segurança.
  escalaMax: number;
}

export const SENSORES: Record<TipoSensor, SensorMeta> = {
  CO2: { label: 'CO₂', unidade: 'ppm', icone: 'cloud-outline', limite: 5000, escalaMax: 6500 },
  CH4: { label: 'Metano', unidade: 'ppm', icone: 'flame-outline', limite: 10000, escalaMax: 13000 },
  VOC: { label: 'COVs', unidade: 'ppb', icone: 'flask-outline', limite: 20000, escalaMax: 26000 },
  Temperatura: { label: 'Temperatura', unidade: '°C', icone: 'thermometer-outline', limite: 45, escalaMax: 55 },
  Umidade: { label: 'Umidade', unidade: '%', icone: 'water-outline', limite: 90, escalaMax: 100 },
};

export function calcularPercentual(tipo: TipoSensor, valor: number): number {
  const meta = SENSORES[tipo];
  if (!meta) return 0;
  return Math.max(0, Math.min(100, Math.round((valor / meta.escalaMax) * 100)));
}

export function estaEmAlerta(tipo: TipoSensor, valor: number): boolean {
  const meta = SENSORES[tipo];
  if (!meta) return false;
  return valor >= meta.limite;
}
