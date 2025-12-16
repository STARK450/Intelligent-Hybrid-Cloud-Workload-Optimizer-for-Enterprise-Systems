import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { SystemMetrics, Pod } from '../types';
import { Cpu, Database, Activity, AlertTriangle, Cloud, Server } from 'lucide-react';

interface DashboardProps {
  metricsHistory: SystemMetrics[];
  currentMetrics: SystemMetrics;
  pods: Pod[];
}

const MetricCard: React.FC<{ title: string; value: string; subValue: string; icon: React.FC<any>; color: string }> = ({ 
  title, value, subValue, icon: Icon, color 
}) => (
  <div className="bg-ibm-gray p-5 rounded-lg border-l-4 border-transparent hover:border-ibm-blue transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
        <h3 className="text-2xl font-mono font-bold text-white mt-1">{value}</h3>
        <p className={`text-xs mt-2 ${color}`}>{subValue}</p>
      </div>
      <div className="p-2 bg-ibm-black rounded-full">
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metricsHistory, currentMetrics, pods }) => {
  const onPremPods = pods.filter(p => p.environment === 'ON_PREM').length;
  const cloudPods = pods.filter(p => p.environment === 'CLOUD').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Avg CPU Load" 
          value={`${currentMetrics.totalCpu.toFixed(1)}%`} 
          subValue={currentMetrics.totalCpu > 80 ? "High Usage" : "Normal Usage"} 
          icon={Cpu} 
          color={currentMetrics.totalCpu > 80 ? "text-ibm-red" : "text-ibm-green"} 
        />
        <MetricCard 
          title="Memory Usage" 
          value={`${(currentMetrics.totalMemory / 1024).toFixed(1)} GB`} 
          subValue="Allocated" 
          icon={Database} 
          color="text-ibm-blue" 
        />
        <MetricCard 
          title="Avg Latency" 
          value={`${currentMetrics.avgLatency.toFixed(0)} ms`} 
          subValue={currentMetrics.avgLatency > 150 ? "Performance Degraded" : "Optimal"} 
          icon={Activity} 
          color={currentMetrics.avgLatency > 150 ? "text-ibm-red" : "text-ibm-green"} 
        />
        <MetricCard 
          title="System Health" 
          value={currentMetrics.errorRate > 2 ? "Warning" : "Healthy"} 
          subValue={`${currentMetrics.errorRate.toFixed(2)}% Error Rate`} 
          icon={AlertTriangle} 
          color={currentMetrics.errorRate > 2 ? "text-ibm-red" : "text-ibm-green"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-ibm-gray p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Real-time Resource Utilization</h3>
            <div className="flex space-x-4 text-xs">
              <span className="flex items-center"><div className="w-3 h-3 bg-ibm-blue rounded-full mr-2"></div>On-Prem</span>
              <span className="flex items-center"><div className="w-3 h-3 bg-ibm-teal rounded-full mr-2"></div>Cloud</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="colorOnPrem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F62FE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F62FE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005D5D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#005D5D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#666" fontSize={10} tick={false} />
                <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161616', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="onPremLoad" stroke="#0F62FE" fillOpacity={1} fill="url(#colorOnPrem)" name="On-Prem Load" />
                <Area type="monotone" dataKey="cloudLoad" stroke="#005D5D" fillOpacity={1} fill="url(#colorCloud)" name="Cloud Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-ibm-gray p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Environment Distribution</h3>
          <div className="h-48 mb-4">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'On-Prem', count: onPremPods, fill: '#0F62FE' },
                { name: 'Cloud', count: cloudPods, fill: '#005D5D' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} allowDecimals={false}/>
                <Tooltip cursor={{fill: '#333'}} contentStyle={{ backgroundColor: '#161616', borderColor: '#333' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-ibm-black rounded border border-ibm-gray/50">
                <div className="flex items-center space-x-3">
                  <Server className="w-4 h-4 text-ibm-blue" />
                  <span className="text-sm">On-Prem Nodes</span>
                </div>
                <span className="font-mono text-ibm-blue font-bold">{onPremPods} Pods</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-ibm-black rounded border border-ibm-gray/50">
                <div className="flex items-center space-x-3">
                  <Cloud className="w-4 h-4 text-ibm-teal" />
                  <span className="text-sm">Cloud Nodes</span>
                </div>
                <span className="font-mono text-ibm-teal font-bold">{cloudPods} Pods</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;