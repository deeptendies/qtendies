// QTendies Quantum Agent - Core Module
// Quantum-inspired agentic finance engine
// Modular architecture with separated concerns

import {
  calculateCoherence,
  calculateReturns,
  calculateVolatility,
  calculateMomentum,
  calculateVolumeRatio,
} from "./quantum/coherence.js";

import { detectRegime, type MarketRegime } from "./quantum/regime.js";
import { optimizePortfolio, shouldRebalance, type Position, type PortfolioMetrics } from "./quantum/portfolio.js";
import { generateSignals, type TradeSignal, type AssetData } from "./quantum/signals.js";
import { verify3x, runBoomerMode, isBoomerRequired, seedBacktest, unseedBacktest, type BacktestRegime, type BoomerResult } from "./quantum/backtest.js";
import {
  fetchAltSignals,
  fetchFedSignals,
  calculateQuantumModifier,
  calculateHypeScore,
  generateAltSignalReport,
  type AltSignalResult,
  type SignalSource,
} from "./core/alt_data.js";

// Re-export for convenience
export { type MarketRegime, type TradeSignal, type AssetData, type Position, type PortfolioMetrics };
export { type BacktestRegime, type BoomerResult };
export { type AltSignalResult, type SignalSource };
export { runBoomerMode, isBoomerRequired, seedBacktest, unseedBacktest, verify3x };
export { fetchAltSignals, fetchFedSignals, generateAltSignalReport };

export interface QuantumPortfolio {
  assets: Position[];
  totalValue: number;
  volatility: number;
  sharpeRatio: number;
  quantumStates: number[];
}

export interface AgentConfig {
  initialCapital: number;
  maxVolatility: number;
  maxPositionSize: number;
  maxPositions: number;
  riskFreeRate: number;
  quantumDimensions: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  initialCapital: 100000,
  maxVolatility: 0.15,
  maxPositionSize: 0.05,
  maxPositions: 20,
  riskFreeRate: 0.045,
  quantumDimensions: 1024,
};

export interface MarketData {
  assets: AssetData[];
  timestamp?: number;
}

export interface AnalysisResult {
  cycle: number;
  regime: MarketRegime;
  signals: TradeSignal[];
  actions: ActionResult[];
  portfolio: { positions: Position[]; metrics: PortfolioMetrics };
  timestamp: number;
}

export interface ActionResult {
  signal: TradeSignal;
  result: { success: boolean; message: string; boomerApproved?: boolean; boomerSummary?: string };
}

export class QuantumFinanceAgent {
  private portfolio: Position[];
  private totalValue: number;
  private config: AgentConfig;
  private regime: MarketRegime;
  private quantumStates: number[];
  private positionCount: number;
  private cycleCount: number;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.portfolio = [];
    this.totalValue = this.config.initialCapital;
    this.regime = { state: "unknown", confidence: 0, superpositionScore: 0, timestamp: Date.now() };
    this.quantumStates = this.initializeQuantumStates(this.config.quantumDimensions);
    this.positionCount = 0;
    this.cycleCount = 0;
  }

  private initializeQuantumStates(dimensions: number): number[] {
    return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
  }

  analyze(marketData: MarketData): AnalysisResult {
    this.cycleCount++;
    const assets = marketData.assets || [];

    // Update market regime
    this.regime = this.detectMarketRegime(assets);

    // Generate trade signals
    const signals = generateSignals(assets, this.regime.state);

    // Check portfolio and generate actions
    const actions = this.generateActions(signals);

    // Optimize portfolio
    const portfolioState = this.getPortfolioState();

    return {
      cycle: this.cycleCount,
      regime: this.regime,
      signals,
      actions,
      portfolio: portfolioState,
      timestamp: Date.now(),
    };
  }

  private detectMarketRegime(assets: AssetData[]): MarketRegime {
    if (assets.length === 0) {
      return { state: "unknown", confidence: 0, superpositionScore: 0, timestamp: Date.now() };
    }

    // Aggregate metrics across assets
    let avgVolatility = 0;
    let avgMomentum = 0;
    let totalVolumeRatio = 0;

    for (const asset of assets) {
      const returns = calculateReturns(asset.priceHistory);
      const volatility = calculateVolatility(returns);
      const momentum = calculateMomentum(asset.priceHistory);
      const volumeRatio = calculateVolumeRatio(asset.volume || []);

      avgVolatility += volatility;
      avgMomentum += momentum;
      totalVolumeRatio += volumeRatio;
    }

    avgVolatility /= assets.length;
    avgMomentum /= assets.length;
    totalVolumeRatio /= assets.length;

    return detectRegime(avgVolatility, avgMomentum, totalVolumeRatio);
  }

  private generateActions(signals: TradeSignal[]): ActionResult[] {
    const actions: ActionResult[] = [];

    for (const signal of signals) {
      const existingPosition = this.portfolio.find(p => p.symbol === signal.symbol);
      const result = this.executeSignal(signal, existingPosition);
      actions.push({ signal, result });
    }

    return actions;
  }

  private executeSignal(
    signal: TradeSignal,
    currentPosition?: Position
  ): { success: boolean; message: string; boomerApproved?: boolean; boomerSummary?: string } {
    if (signal.confidence < 0.5) {
      return { success: false, message: `Confidence too low: ${signal.confidence}` };
    }

    if (this.positionCount >= this.config.maxPositions && signal.action === "buy") {
      return { success: false, message: "Maximum positions reached" };
    }

    if (signal.action === "buy" && currentPosition) {
      return { success: false, message: "Position already exists" };
    }

    if (signal.action === "sell" && !currentPosition) {
      return { success: false, message: "No position to sell" };
    }

    // Boomer Mode verification for buy signals
    if (signal.action === "buy") {
      const tradeValue = this.totalValue * this.config.maxPositionSize;

      if (isBoomerRequired(this.positionCount, tradeValue)) {
        console.log(`[BOOMER] Running triple-backtest verification for ${signal.symbol}...`);

        // Create mock positions array including this new position
        const newPosition: Position = {
          symbol: signal.symbol,
          quantity: tradeValue / signal.targetPrice,
          avgPrice: signal.targetPrice,
          currentPrice: signal.targetPrice,
          weight: this.config.maxPositionSize,
          quantumEntanglement: signal.quantumState / this.config.quantumDimensions,
        };

        const mockPositions = [...this.portfolio, newPosition];
        const boomer = runBoomerMode(mockPositions, this.totalValue);

        if (!boomer.passed) {
          return {
            success: false,
            message: `BOOMER REJECTED: ${boomer.summary}`,
            boomerApproved: false,
            boomerSummary: boomer.summary,
          };
        }

        console.log(`[BOOMER] Approved: ${boomer.summary}`);
      }
    }

    if (signal.action === "buy") {
      const positionValue = this.totalValue * this.config.maxPositionSize;
      const quantity = positionValue / signal.targetPrice;

      const newPosition: Position = {
        symbol: signal.symbol,
        quantity,
        avgPrice: signal.targetPrice,
        currentPrice: signal.targetPrice,
        weight: this.config.maxPositionSize,
        quantumEntanglement: signal.quantumState / this.config.quantumDimensions,
      };

      this.portfolio.push(newPosition);
      this.positionCount++;
    }

    if (signal.action === "sell" && currentPosition) {
      this.portfolio = this.portfolio.filter(p => p.symbol !== signal.symbol);
      this.positionCount--;
    }

    return {
      success: true,
      message: `${signal.action.toUpperCase()} ${signal.symbol} at $${signal.targetPrice.toFixed(2)}`,
    };
  }

  private getPortfolioState(): { positions: Position[]; metrics: PortfolioMetrics } {
    let totalValue = 0;
    for (const position of this.portfolio) {
      totalValue += position.currentPrice * position.quantity;
    }
    this.totalValue = totalValue || this.config.initialCapital;

    // Calculate metrics
    let weightedVariance = 0;
    for (const position of this.portfolio) {
      const weight = (position.currentPrice * position.quantity) / this.totalValue;
      weightedVariance += Math.pow(weight * 0.2, 2);
    }
    const volatility = Math.sqrt(weightedVariance) * Math.sqrt(252);
    const portfolioReturn = this.estimateReturn();
    const sharpeRatio = volatility > 0
      ? (portfolioReturn - this.config.riskFreeRate) / volatility
      : 0;

    const metrics: PortfolioMetrics = {
      totalValue: this.totalValue,
      volatility,
      sharpeRatio,
      maxDrawdown: volatility * 2,
    };

    return { positions: [...this.portfolio], metrics };
  }

  private estimateReturn(): number {
    let weightedReturn = 0;
    for (const position of this.portfolio) {
      const weight = (position.currentPrice * position.quantity) / this.totalValue;
      weightedReturn += weight * 0.001;
    }
    return weightedReturn * 252;
  }

  getStatus(): string {
    const portfolioState = this.getPortfolioState();
    return JSON.stringify({
      cycle: this.cycleCount,
      portfolioValue: this.totalValue.toFixed(2),
      positions: this.portfolio.length,
      regime: this.regime.state,
      regimeConfidence: (this.regime.confidence * 100).toFixed(1) + "%",
      sharpeRatio: portfolioState.metrics.sharpeRatio.toFixed(3),
      volatility: (portfolioState.metrics.volatility * 100).toFixed(2) + "%",
    }, null, 2);
  }

  getPortfolio(): Position[] {
    return [...this.portfolio];
  }

  getRegime(): MarketRegime {
    return { ...this.regime };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  // Quantum state access for advanced analytics
  getQuantumStates(): number[] {
    return [...this.quantumStates];
  }

  /**
   * Health check for production monitoring
   * Returns agent health status and last cycle info
   */
  healthCheck(): { status: "healthy" | "degraded" | "unhealthy"; lastCycle: number; lastRegime: string; portfolioValue: number; errors: string[] } {
    const errors: string[] = [];

    // Check for issues
    if (this.cycleCount === 0) {
      errors.push("No cycles completed yet");
    }
    if (this.totalValue <= 0) {
      errors.push("Portfolio value is zero or negative");
    }
    if (this.regime.state === "unknown") {
      errors.push("Market regime is unknown");
    }

    // Determine status
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (errors.length > 0) {
      status = errors.length >= 2 ? "unhealthy" : "degraded";
    }

    return {
      status,
      lastCycle: this.cycleCount,
      lastRegime: this.regime.state,
      portfolioValue: this.totalValue,
      errors,
    };
  }

  /**
   * Analyze market with alternative data signals (Modern Signal Stack)
   * Integrates social sentiment, on-chain, congressional, GitHub, and FED data
   */
  async analyzeWithAltData(
    marketData: MarketData,
    altSources?: SignalSource[]
  ): Promise<AnalysisResult & { altSignals: AltSignalResult[]; fedHawkishness: number }> {
    this.cycleCount++;
    const assets = marketData.assets || [];

    // Update market regime
    this.regime = this.detectMarketRegime(assets);

    // Generate base trade signals
    const signals = generateSignals(assets, this.regime.state);

    // Fetch alternative signals for each asset
    const altSignals: AltSignalResult[] = [];
    for (const asset of assets) {
      const sources = altSources || ["social_sentiment", "on_chain", "congressional_trades", "github_activity"];
      const altSignal = await fetchAltSignals(asset.symbol, sources);
      altSignals.push(altSignal);
    }

    // Fetch FED hawkishness (global signal)
    const fed = await fetchFedSignals();

    // Apply quantum modifiers to signals
    for (let i = 0; i < signals.length; i++) {
      const alt = altSignals[i];
      if (alt) {
        // Adjust signal confidence based on alternative data
        const altBoost = alt.quantumModifier - 1; // -0.5 to +0.5
        signals[i].confidence = Math.min(0.95, signals[i].confidence + altBoost * 0.2);

        // Add reasoning from alt signals
        signals[i].reasoning += ` | Alt-boost: ${alt.aggregateScore > 0 ? "+" : ""}${(alt.aggregateScore * 100).toFixed(0)}% from ${alt.signals.length} sources`;
      }
    }

    // Check portfolio and generate actions
    const actions = this.generateActions(signals);

    // Optimize portfolio
    const portfolioState = this.getPortfolioState();

    return {
      cycle: this.cycleCount,
      regime: this.regime,
      signals,
      actions,
      portfolio: portfolioState,
      timestamp: Date.now(),
      altSignals,
      fedHawkishness: fed.hawkishScore,
    };
  }
}

// Singleton for agent operations
let agentInstance: QuantumFinanceAgent | null = null;
let lastConfig: AgentConfig | null = null;

export function getAgent(config?: Partial<AgentConfig>): QuantumFinanceAgent {
  if (agentInstance && lastConfig) {
    // Return existing instance if config matches
    if (config && isConfigEqual(config, lastConfig)) {
      return agentInstance;
    }
    // Config differs - return new instance (allow different configs in same process)
    return new QuantumFinanceAgent(config);
  }
  agentInstance = new QuantumFinanceAgent(config);
  lastConfig = { ...DEFAULT_CONFIG, ...config };
  return agentInstance;
}

function isConfigEqual(a: Partial<AgentConfig>, b: AgentConfig): boolean {
  return (
    a.initialCapital === b.initialCapital &&
    a.maxVolatility === b.maxVolatility &&
    a.maxPositionSize === b.maxPositionSize &&
    a.maxPositions === b.maxPositions &&
    a.riskFreeRate === b.riskFreeRate &&
    a.quantumDimensions === b.quantumDimensions
  );
}

export function resetAgent(): void {
  agentInstance = null;
  lastConfig = null;
}