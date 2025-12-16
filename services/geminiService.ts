import { GoogleGenAI, Type } from "@google/genai";
import { SystemMetrics, Pod, LogEntry, AIRecommendation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeSystemHealth = async (
  metrics: SystemMetrics,
  pods: Pod[],
  recentLogs: LogEntry[]
): Promise<AIRecommendation[]> => {
  try {
    const prompt = `
      You are an AI Site Reliability Engineer (SRE) managing a Hybrid Cloud environment.
      
      Current System State:
      - Global CPU Load: ${metrics.totalCpu.toFixed(1)}%
      - Global Memory Usage: ${metrics.totalMemory.toFixed(0)} MB
      - Average Latency: ${metrics.avgLatency.toFixed(0)} ms
      - Error Rate: ${metrics.errorRate.toFixed(2)}%
      - Cloud Load: ${metrics.cloudLoad.toFixed(1)}%
      - On-Prem Load: ${metrics.onPremLoad.toFixed(1)}%

      Active Workloads (Top 5 by CPU):
      ${JSON.stringify(pods.sort((a, b) => b.cpuUsage - a.cpuUsage).slice(0, 5), null, 2)}

      Recent Critical Logs:
      ${JSON.stringify(recentLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').slice(0, 3), null, 2)}

      Analyze this data and provide 3 specific, actionable recommendations to optimize performance, reduce cost, or improve reliability.
      Focus on migration decisions (On-Prem to Cloud for bursting, Cloud to On-Prem for cost) and scaling.
      
      Return ONLY a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['SCALE', 'MIGRATE', 'OPTIMIZE'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              targetPodId: { type: Type.STRING }
            },
            required: ['id', 'type', 'title', 'description', 'impact', 'confidence']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIRecommendation[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return [];
  }
};

export const analyzeLogs = async (logs: LogEntry[]): Promise<string> => {
  try {
    const logText = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.service}: ${l.message}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze these system logs for root causes of anomalies. Be brief and technical. \n\n${logText}`,
    });

    return response.text || "No analysis available.";
  } catch (error) {
    return "Failed to analyze logs.";
  }
};