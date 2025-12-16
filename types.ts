export type Environment = 'ON_PREM' | 'CLOUD';

export interface Pod {
  id: string;
  name: string;
  environment: Environment;
  status: 'RUNNING' | 'PENDING' | 'ERROR' | 'MIGRATING';
  cpuUsage: number; // Percentage 0-100
  memoryUsage: number; // MB
  latency: number; // ms
  uptime: number; // seconds
  replicas: number;
}

export interface SystemMetrics {
  timestamp: string;
  totalCpu: number;
  totalMemory: number;
  avgLatency: number;
  activePods: number;
  errorRate: number;
  onPremLoad: number;
  cloudLoad: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  service: string;
  message: string;
}

export interface AIRecommendation {
  id: string;
  type: 'SCALE' | 'MIGRATE' | 'OPTIMIZE';
  title: string;
  description: string;
  impact: string; // e.g., "Reduces latency by 40%"
  confidence: number;
  targetPodId?: string;
  targetEnvironment?: Environment;
}

export interface OptimizationResult {
  before: number;
  after: number;
  metric: string;
}