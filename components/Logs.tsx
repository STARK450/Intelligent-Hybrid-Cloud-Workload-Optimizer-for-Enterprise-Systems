import React, { useState } from 'react';
import { LogEntry } from '../types';
import { analyzeLogs } from '../services/geminiService';
import { Terminal, Search, AlertCircle, Info, XCircle } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeLogs = async () => {
    setAnalyzing(true);
    const result = await analyzeLogs(logs.slice(-20)); // Analyze last 20 logs
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      <div className="lg:col-span-3 bg-ibm-black rounded-lg border border-gray-800 flex flex-col font-mono text-sm overflow-hidden">
        <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">/var/log/syslog</span>
          </div>
          <button 
            onClick={handleAnalyzeLogs}
            disabled={analyzing}
            className="text-xs bg-ibm-gray hover:bg-gray-700 px-3 py-1 rounded text-white transition-colors"
          >
            {analyzing ? "Scanning..." : "Scan for Anomalies (AI)"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0a0a0a]">
          {logs.length === 0 && <p className="text-gray-600 italic">No logs generated yet...</p>}
          {logs.map((log) => (
            <div key={log.id} className="flex space-x-3 hover:bg-white/5 p-0.5 rounded">
              <span className="text-gray-500 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={`w-16 font-bold ${
                log.level === 'ERROR' || log.level === 'CRITICAL' ? 'text-red-500' :
                log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'
              }`}>
                {log.level}
              </span>
              <span className="text-gray-400 w-24">{log.service}:</span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <div className="bg-ibm-gray rounded-lg p-5 border border-ibm-gray/50 h-full overflow-y-auto">
            <h3 className="text-white font-bold mb-4 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                AI Log Analysis
            </h3>
            
            {analysis ? (
                <div className="prose prose-invert prose-sm">
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{analysis}</p>
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-10">
                    <p className="text-sm">Click "Scan for Anomalies" to have Gemini analyze the recent log stream for patterns and root causes.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Logs;