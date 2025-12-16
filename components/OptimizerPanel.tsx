import React, { useState } from 'react';
import { SystemMetrics, Pod, LogEntry, AIRecommendation } from '../types';
import { analyzeSystemHealth } from '../services/geminiService';
import { BrainCircuit, Check, X, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';

interface OptimizerPanelProps {
  metrics: SystemMetrics;
  pods: Pod[];
  logs: LogEntry[];
  onApplyRecommendation: (rec: AIRecommendation) => void;
}

const OptimizerPanel: React.FC<OptimizerPanelProps> = ({ metrics, pods, logs, onApplyRecommendation }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const recs = await analyzeSystemHealth(metrics, pods, logs);
    setRecommendations(recs);
    setIsAnalyzing(false);
    setLastAnalysis(new Date().toLocaleTimeString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Panel: Control Center */}
      <div className="lg:col-span-1 bg-ibm-gray rounded-lg p-6 border border-ibm-gray/50 flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-ibm-purple/20 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-ibm-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Decision Engine</h2>
            <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div className="bg-ibm-black p-4 rounded border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Model Context</h3>
            <div className="space-y-2 text-xs text-gray-500 font-mono">
              <div className="flex justify-between">
                <span>Input Vectors:</span>
                <span className="text-white">CPU, Mem, Latency, Err</span>
              </div>
              <div className="flex justify-between">
                <span>Optimization Goal:</span>
                <span className="text-ibm-blue">Balanced Efficiency</span>
              </div>
              <div className="flex justify-between">
                <span>Last Analysis:</span>
                <span className="text-white">{lastAnalysis || 'Never'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded font-bold flex items-center justify-center space-x-2 transition-all ${
              isAnalyzing 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-ibm-blue to-ibm-purple hover:opacity-90 text-white shadow-lg shadow-ibm-purple/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Insights...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run Optimization Analysis</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 leading-relaxed">
            The AI engine analyzes real-time telemetry from Prometheus exporters and Kubernetes events to recommend topology changes.
          </p>
        </div>
      </div>

      {/* Right Panel: Recommendations */}
      <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            Generated Insights 
            {recommendations.length > 0 && <span className="ml-2 bg-ibm-blue text-xs px-2 py-0.5 rounded-full">{recommendations.length}</span>}
        </h3>
        
        {recommendations.length === 0 && !isAnalyzing && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
                <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
                <p>No active recommendations. Run analysis to start.</p>
            </div>
        )}

        {isAnalyzing && (
             <div className="space-y-4">
                 {[1,2,3].map(i => (
                     <div key={i} className="h-32 bg-ibm-gray rounded-lg animate-pulse"></div>
                 ))}
             </div>
        )}

        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-ibm-gray rounded-lg border-l-4 border-ibm-purple p-5 shadow-lg animate-fade-in group hover:bg-[#333] transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    rec.type === 'MIGRATE' ? 'bg-orange-900 text-orange-200' :
                    rec.type === 'SCALE' ? 'bg-blue-900 text-blue-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {rec.type}
                  </span>
                  <span className="text-xs text-gray-400">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                
                <div className="flex items-center space-x-2 text-xs bg-black/20 p-2 rounded w-fit">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-gray-400">Expected Impact:</span>
                    <span className="text-green-400 font-semibold">{rec.impact}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button 
                  onClick={() => onApplyRecommendation(rec)}
                  className="p-2 bg-ibm-blue text-white rounded hover:bg-ibm-lightblue transition-colors flex items-center justify-center group-hover:w-32 w-10 overflow-hidden"
                  title="Apply Recommendation"
                >
                    <span className="hidden group-hover:inline text-xs font-bold mr-2 whitespace-nowrap">EXECUTE</span>
                    <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
                  }}
                  className="p-2 bg-transparent border border-gray-600 text-gray-400 rounded hover:border-ibm-red hover:text-ibm-red transition-colors w-10 flex items-center justify-center"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizerPanel;