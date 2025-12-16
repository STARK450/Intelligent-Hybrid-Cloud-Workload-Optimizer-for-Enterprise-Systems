import React from 'react';
import { Pod, Environment } from '../types';
import { Server, Cloud, RefreshCw, AlertCircle, ArrowRightLeft, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

interface WorkloadsProps {
  pods: Pod[];
  onMigrate: (podId: string, to: Environment) => void;
  onScale: (podId: string, direction: 'UP' | 'DOWN') => void;
}

const Workloads: React.FC<WorkloadsProps> = ({ pods, onMigrate, onScale }) => {
  return (
    <div className="bg-ibm-gray rounded-lg overflow-hidden border border-ibm-gray/50 animate-fade-in">
      <div className="p-6 border-b border-ibm-gray/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Active Workloads</h2>
        <div className="flex space-x-2">
           <button className="px-3 py-1 bg-ibm-blue text-white text-xs rounded hover:bg-ibm-lightblue transition">
             Deploy New
           </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ibm-black text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">CPU / Mem</th>
              <th className="px-6 py-4">Replicas</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ibm-gray/50">
            {pods.map((pod) => {
              const isMigrating = pod.status === 'MIGRATING';
              const isRunning = pod.status === 'RUNNING';

              return (
                <tr 
                  key={pod.id} 
                  className={`transition-colors ${
                    isMigrating 
                      ? 'bg-ibm-blue/5' 
                      : 'hover:bg-ibm-black/30'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                        isMigrating ? 'bg-ibm-blue/20 border-ibm-blue animate-pulse' : 'bg-ibm-black border-gray-700'
                      }`}>
                        <span className="font-mono text-xs text-ibm-blue font-bold">{pod.name.substring(0,2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${isMigrating ? 'text-ibm-blue' : 'text-white'}`}>{pod.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{pod.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pod.environment === 'CLOUD' ? 'bg-ibm-teal/20 text-ibm-teal' : 'bg-ibm-blue/20 text-ibm-blue'
                    }`}>
                      {pod.environment === 'CLOUD' ? <Cloud className="w-3 h-3 mr-1" /> : <Server className="w-3 h-3 mr-1" />}
                      {pod.environment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {pod.status === 'RUNNING' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                      {pod.status === 'MIGRATING' && <RefreshCw className="h-4 w-4 text-ibm-blue mr-2 animate-spin" />}
                      {pod.status === 'PENDING' && <Clock className="h-4 w-4 text-yellow-500 mr-2" />}
                      {pod.status === 'ERROR' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                      <span className={`text-sm font-medium ${
                        isMigrating ? 'text-ibm-blue animate-pulse' : 'text-gray-300'
                      }`}>{pod.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>CPU</span>
                        <span>{pod.cpuUsage.toFixed(0)}%</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMigrating ? 'bg-gray-500 w-full animate-pulse' :
                            pod.cpuUsage > 80 ? 'bg-ibm-red' : 'bg-ibm-blue'
                          }`} 
                          style={{ width: isMigrating ? '100%' : `${pod.cpuUsage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{pod.memoryUsage} MB</div>
                    </div>
                  </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                         <span className="font-mono text-white">{pod.replicas}</span>
                         <div className="flex flex-col space-y-0.5">
                            <button 
                              onClick={() => onScale(pod.id, 'UP')}
                              disabled={!isRunning}
                              className={`text-gray-500 ${isRunning ? 'hover:text-white' : 'opacity-30 cursor-not-allowed'}`}
                            >
                               <TrendingUp className="w-3 h-3" />
                            </button>
                         </div>
                      </div>
                   </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onMigrate(pod.id, pod.environment === 'ON_PREM' ? 'CLOUD' : 'ON_PREM')}
                        disabled={!isRunning}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                          !isRunning 
                          ? 'opacity-40 cursor-not-allowed bg-gray-800 text-gray-500 border border-transparent' 
                          : 'bg-ibm-blue/10 text-ibm-blue hover:bg-ibm-blue hover:text-white border border-ibm-blue/50'
                        }`}
                      >
                        {isMigrating ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Moving...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>{pod.environment === 'ON_PREM' ? 'To Cloud' : 'To Prem'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Workloads;