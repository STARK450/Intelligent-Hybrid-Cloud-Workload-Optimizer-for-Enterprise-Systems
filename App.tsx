import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Workloads from './components/Workloads';
import OptimizerPanel from './components/OptimizerPanel';
import Logs from './components/Logs';
import { Pod, SystemMetrics, LogEntry, Environment, AIRecommendation } from './types';

// Mock Services
const MOCK_SERVICES = ['payment-gateway', 'auth-service', 'inventory-db', 'frontend-ui', 'analytics-worker', 'notification-queue'];

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // -- STATE --
  const [pods, setPods] = useState<Pod[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ticker, setTicker] = useState(0);

  // -- INITIALIZATION --
  useEffect(() => {
    // Create initial pods
    const initialPods: Pod[] = Array.from({ length: 8 }).map((_, i) => ({
      id: uuid(),
      name: MOCK_SERVICES[i % MOCK_SERVICES.length] + `-${i}`,
      environment: i < 5 ? 'ON_PREM' : 'CLOUD',
      status: 'RUNNING',
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      memoryUsage: Math.floor(Math.random() * 500) + 128,
      latency: Math.floor(Math.random() * 50) + 10,
      uptime: 0,
      replicas: 1
    }));
    setPods(initialPods);
  }, []);

  // -- SIMULATION LOOP --
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
      
      // Update Pods (Simulate fluctuating load)
      setPods(currentPods => currentPods.map(pod => {
        if (pod.status !== 'RUNNING') return pod;

        // Random fluctuation
        let cpuChange = Math.floor(Math.random() * 10) - 4; // -4 to +5
        let memChange = Math.floor(Math.random() * 20) - 5;
        
        // Spike simulation occasionally
        if (Math.random() > 0.95) cpuChange += 30;

        let newCpu = Math.max(0, Math.min(100, pod.cpuUsage + cpuChange));
        let newMem = Math.max(50, pod.memoryUsage + memChange);
        
        // Latency higher on Prem if CPU is high
        let baseLatency = pod.environment === 'ON_PREM' ? 30 : 15;
        if (newCpu > 80) baseLatency += 100; // Latency spike under load
        
        // Simulate Errors
        if (newCpu > 95 && Math.random() > 0.9) {
             addLog('ERROR', pod.name, `CPU Thrashing detected. Thread starvation.`);
        }

        return {
          ...pod,
          cpuUsage: newCpu,
          memoryUsage: newMem,
          latency: baseLatency + (Math.random() * 10),
          uptime: pod.uptime + 2
        };
      }));

      // Generate Logs occasionally
      if (Math.random() > 0.7) {
        const service = MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)];
        const types: {level: any, msg: string}[] = [
           { level: 'INFO', msg: 'Health check passed.' },
           { level: 'INFO', msg: 'Request processed successfully.' },
           { level: 'WARN', msg: 'Response time > 200ms.' },
           { level: 'WARN', msg: 'Connection pool reaching limit.' }
        ];
        const logData = types[Math.floor(Math.random() * types.length)];
        addLog(logData.level, service, logData.msg);
      }

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // -- AGGREGATE METRICS --
  const currentMetrics: SystemMetrics = React.useMemo(() => {
    const totalCpu = pods.reduce((acc, p) => acc + p.cpuUsage, 0) / (pods.length || 1);
    const totalMem = pods.reduce((acc, p) => acc + p.memoryUsage, 0);
    const avgLat = pods.reduce((acc, p) => acc + p.latency, 0) / (pods.length || 1);
    
    // Calculate load distribution
    const onPremPods = pods.filter(p => p.environment === 'ON_PREM');
    const cloudPods = pods.filter(p => p.environment === 'CLOUD');
    const onPremLoad = onPremPods.reduce((acc, p) => acc + p.cpuUsage, 0) / (onPremPods.length || 1);
    const cloudLoad = cloudPods.reduce((acc, p) => acc + p.cpuUsage, 0) / (cloudPods.length || 1);

    // Calc error rate based on recent error logs
    const recentErrors = logs.slice(-10).filter(l => l.level === 'ERROR').length;
    const errorRate = (recentErrors / 10) * 100;

    const metrics = {
      timestamp: new Date().toLocaleTimeString(),
      totalCpu,
      totalMemory: totalMem,
      avgLatency: avgLat,
      activePods: pods.length,
      errorRate,
      onPremLoad,
      cloudLoad
    };
    
    // Update history only when metrics change significantly or time passes
    setMetricsHistory(prev => [...prev.slice(-19), metrics]); // Keep last 20
    
    return metrics;
  }, [pods, logs]); // Recalculate when pods update

  // -- ACTIONS --
  const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL', service: string, message: string) => {
    setLogs(prev => [...prev, {
      id: uuid(),
      timestamp: new Date().toISOString(),
      level,
      service,
      message
    }]);
  };

  const handleMigrate = (podId: string, to: Environment) => {
    setPods(current => current.map(p => {
      if (p.id === podId) {
        addLog('INFO', 'orchestrator', `Initiating migration of ${p.name} to ${to}`);
        return { ...p, status: 'MIGRATING' };
      }
      return p;
    }));

    // Simulate migration delay
    setTimeout(() => {
      setPods(current => current.map(p => {
        if (p.id === podId) {
          addLog('INFO', 'orchestrator', `Migration of ${p.name} to ${to} completed successfully.`);
          return { ...p, status: 'RUNNING', environment: to, cpuUsage: Math.max(10, p.cpuUsage - 10) }; // Bonus: migration lowers load often
        }
        return p;
      }));
    }, 3000);
  };

  const handleScale = (podId: string, direction: 'UP' | 'DOWN') => {
    setPods(current => current.map(p => {
      if (p.id === podId) {
        const newReplicas = direction === 'UP' ? p.replicas + 1 : Math.max(1, p.replicas - 1);
        addLog('INFO', 'autoscaler', `Scaling ${p.name} ${direction} to ${newReplicas} replicas.`);
        // Scaling up reduces CPU usage per pod (load balancing simulation)
        const loadFactor = direction === 'UP' ? 0.7 : 1.3;
        return { 
          ...p, 
          replicas: newReplicas,
          cpuUsage: Math.min(100, p.cpuUsage * loadFactor)
        };
      }
      return p;
    }));
  };

  const handleApplyRecommendation = (rec: AIRecommendation) => {
    if (rec.type === 'MIGRATE' && rec.targetPodId) {
      // Find environment to migrate to (swap)
      const pod = pods.find(p => p.id === rec.targetPodId);
      if (pod) {
        handleMigrate(rec.targetPodId, pod.environment === 'ON_PREM' ? 'CLOUD' : 'ON_PREM');
      }
    } else if (rec.type === 'SCALE' && rec.targetPodId) {
      handleScale(rec.targetPodId, 'UP'); // AI usually suggests scaling UP for perf
    }
  };

  // -- RENDER --
  return (
    <div className="flex bg-ibm-black min-h-screen font-sans text-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Project ID: IBM-ISDL-HYBRID-01</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-xs text-gray-400">Environment Status</p>
                <div className="flex items-center justify-end space-x-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-sm font-bold text-white">OPERATIONAL</span>
                </div>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard 
            metricsHistory={metricsHistory} 
            currentMetrics={currentMetrics}
            pods={pods}
          />
        )}
        
        {activeTab === 'workloads' && (
          <Workloads 
            pods={pods} 
            onMigrate={handleMigrate} 
            onScale={handleScale} 
          />
        )}

        {activeTab === 'optimizer' && (
          <OptimizerPanel 
            metrics={currentMetrics}
            pods={pods}
            logs={logs}
            onApplyRecommendation={handleApplyRecommendation}
          />
        )}

        {activeTab === 'logs' && (
          <Logs logs={logs} />
        )}
      </main>
    </div>
  );
};

export default App;