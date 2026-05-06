// TradingAgents Bridge - Integration with TauricResearch/TradingAgents
// Enables qtendies to leverage multi-agent LLM financial trading framework

import { spawn } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify((command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
  require("node:child_process").exec(command, callback);
});

export interface TradingAgentsConfig {
  pythonPath?: string;
  tradingAgentsPath?: string;
  deepThinkModel?: string;
  quickThinkModel?: string;
  maxDebateRounds?: number;
  dataVendor?: "yfinance" | "alpha_vantage";
}

export interface AnalystReport {
  fundamentals: {
    intrinsicValue: number;
    redFlags: string[];
    score: number; // 1-5
  };
  sentiment: {
    score: number; // 1-5
    socialMediaSignals: string[];
    shortTermMood: string;
  };
  news: {
    score: number; // 1-5
    impactIndicators: string[];
    globalEvents: string[];
  };
  technical: {
    pattern: string;
    indicators: Record<string, number>;
    signal: "bullish" | "bearish" | "neutral";
  };
}

export interface DebateRound {
  round: number;
  bullCase: string;
  bearCase: string;
  consensus: string;
}

export interface TradingAgentsDecision {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number; // 0-1
  positionSize: number; // percentage of portfolio
  reasoning: string;
  ticker: string;
  date: string;
  analystsReport?: AnalystReport;
  debateRounds?: DebateRound[];
  riskAssessment?: {
    volatility: number;
    liquidity: number;
    overallRisk: "low" | "medium" | "high";
  };
}

const DEFAULT_CONFIG: Required<TradingAgentsConfig> = {
  pythonPath: "python",
  tradingAgentsPath: "/tmp/TradingAgents",
  deepThinkModel: "gpt-4.1",
  quickThinkModel: "gpt-4.1-mini",
  maxDebateRounds: 2,
  dataVendor: "yfinance",
};

export class TradingAgentsBridge {
  private config: Required<TradingAgentsConfig>;

  constructor(config: TradingAgentsConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<TradingAgentsConfig>;
  }

  /**
   * Run full TradingAgents multi-agent analysis
   */
  async analyze(ticker: string, date: string): Promise<TradingAgentsDecision> {
    const script = `
import sys
sys.path.insert(0, '${this.config.tradingAgentsPath}')

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
import json

config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "${this.config.deepThinkModel}"
config["quick_think_llm"] = "${this.config.quickThinkModel}"
config["max_debate_rounds"] = ${this.config.maxDebateRounds}
config["data_vendors"] = {
    "core_stock_apis": "${this.config.dataVendor}",
    "technical_indicators": "${this.config.dataVendor}",
    "fundamental_data": "${this.config.dataVendor}",
    "news_data": "${this.config.dataVendor}",
}

ta = TradingAgentsGraph(debug=False, config=config)
_, decision = ta.propagate("${ticker}", "${date}")

# Output as JSON
output = {
    "action": decision.get("action", "HOLD"),
    "confidence": decision.get("confidence", 0.5),
    "position_size": decision.get("position_size", 0.05),
    "reasoning": decision.get("reasoning", ""),
    "ticker": "${ticker}",
    "date": "${date}",
}
print(json.dumps(output))
`;

    try {
      const result = await this.runPython(script);
      return JSON.parse(result) as TradingAgentsDecision;
    } catch (error) {
      console.error("[TradingAgentsBridge] Analysis failed:", error);
      return {
        action: "HOLD",
        confidence: 0,
        positionSize: 0,
        reasoning: `Analysis failed: ${error}`,
        ticker,
        date,
      };
    }
  }

  /**
   * Get analyst team report
   */
  async getAnalystsReport(ticker: string, date: string): Promise<AnalystReport | null> {
    const script = `
import sys
sys.path.insert(0, '${this.config.tradingAgentsPath}')

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
import json

config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "${this.config.deepThinkModel}"
config["quick_think_llm"] = "${this.config.quickThinkModel}"

ta = TradingAgentsGraph(debug=False, config=config)
result, _ = ta.propagate("${ticker}", "${date}")

# Extract analyst data if available
analysts = result.get("analysts", {}) if isinstance(result, dict) else {}
print(json.dumps(analysts))
`;

    try {
      const result = await this.runPython(script);
      return JSON.parse(result) as AnalystReport;
    } catch (error) {
      console.error("[TradingAgentsBridge] Failed to get analysts report:", error);
      return null;
    }
  }

  /**
   * Get bull/bear debate history
   */
  async getDebateHistory(ticker: string, date: string): Promise<DebateRound[]> {
    const script = `
import sys
sys.path.insert(0, '${this.config.tradingAgentsPath}')

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
import json

config = DEFAULT_CONFIG.copy()
config["max_debate_rounds"] = ${this.config.maxDebateRounds}

ta = TradingAgentsGraph(debug=False, config=config)
result, _ = ta.propagate("${ticker}", "${date}")

# Extract debate rounds if available
debate = result.get("debate_rounds", []) if isinstance(result, dict) else []
print(json.dumps(debate))
`;

    try {
      const result = await this.runPython(script);
      return JSON.parse(result) as DebateRound[];
    } catch (error) {
      console.error("[TradingAgentsBridge] Failed to get debate history:", error);
      return [];
    }
  }

  /**
   * Convert TradingAgents decision to quantum modifier
   */
  static toQuantumModifier(decision: TradingAgentsDecision): number {
    switch (decision.action) {
      case "BUY":
        // Boost: 1.1 to 1.4 based on confidence
        return 1.0 + decision.confidence * 0.4;
      case "SELL":
        // Reduce: 0.6 to 0.9 based on confidence
        return 1.0 - decision.confidence * 0.4;
      case "HOLD":
      default:
        // Neutral with slight adjustment based on confidence
        return 1.0 + (decision.confidence - 0.5) * 0.2;
    }
  }

  /**
   * Run Python script and return output
   */
  private async runPython(script: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.config.pythonPath, ["-c", script], {
        timeout: 120000, // 2 minute timeout
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Python script failed: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }
}

/**
 * Quick check if TradingAgents is available
 */
export async function isTradingAgentsAvailable(): Promise<boolean> {
  try {
    const bridge = new TradingAgentsBridge();
    await bridge.analyze("AAPL", "2024-01-01");
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate trading signal from TradingAgents decision
 */
export function generateTradingSignal(
  decision: TradingAgentsDecision,
  baseConfidence: number
): {
  action: "buy" | "sell" | "hold";
  confidence: number;
  quantumModifier: number;
  reasoning: string;
} {
  const quantumModifier = TradingAgentsBridge.toQuantumModifier(decision);

  // Combine base confidence with TradingAgents confidence
  const combinedConfidence = (baseConfidence + decision.confidence) / 2;

  return {
    action: decision.action.toLowerCase() as "buy" | "sell" | "hold",
    confidence: Math.min(0.95, combinedConfidence),
    quantumModifier,
    reasoning: `[TradingAgents] ${decision.reasoning} (Conviction: ${(decision.confidence * 100).toFixed(0)}%)`,
  };
}