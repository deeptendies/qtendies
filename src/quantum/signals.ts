// Trade Signal Generator
// Quantum-inspired trade signal generation with confidence scoring

import {
  calculateCoherence,
  calculateReturns,
  calculateVolatility,
  calculateMomentum,
  type CoherenceResult
} from "./coherence.js";

export interface TradeSignal {
  symbol: string;
  action: "buy" | "sell" | "hold";
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  quantumState: number;
  timestamp: number;
  reasoning: string;
}

export interface SignalConfig {
  minConfidence: number;
  maxSignalsPerCycle: number;
  regimeAwareThresholds: boolean;
}

export interface AssetData {
  symbol: string;
  price: number;
  priceHistory: number[];
  volume?: number[];
}

const DEFAULT_CONFIG: SignalConfig = {
  minConfidence: 0.5,
  maxSignalsPerCycle: 10,
  regimeAwareThresholds: true,
};

export function generateSignals(
  assets: AssetData[],
  regime: string,
  config: SignalConfig = DEFAULT_CONFIG
): TradeSignal[] {
  const threshold = config.regimeAwareThresholds
    ? getRegimeThreshold(regime)
    : 0.01;

  const signals: TradeSignal[] = [];

  for (const asset of assets) {
    const signal = analyzeAsset(asset, threshold);
    if (signal.confidence >= config.minConfidence) {
      signals.push(signal);
    }

    if (signals.length >= config.maxSignalsPerCycle) {
      break;
    }
  }

  return signals.sort((a, b) => b.confidence - a.confidence);
}

function analyzeAsset(asset: AssetData, threshold: number): TradeSignal {
  const history = asset.priceHistory;
  const returns = calculateReturns(history);
  const volatility = calculateVolatility(returns);
  const momentum = calculateMomentum(history);

  // Quantum state calculation
  const quantumState = (Math.abs(momentum) * 100 + volatility * 50) % 1024;

  // Expected return and risk
  const expectedReturn = momentum + volatility * 0.5;
  const risk = Math.min(volatility * 2, 0.2);

  // Confidence based on coherence
  const coherence = calculateCoherence(returns);
  const confidence = Math.min(coherence.coherence, 0.95);

  // Determine action
  let action: "buy" | "sell" | "hold";
  let reasoning: string;

  if (expectedReturn > threshold && confidence > 0.6) {
    action = "buy";
    reasoning = `Positive expected return ${(expectedReturn * 100).toFixed(2)}% with confidence ${(confidence * 100).toFixed(1)}%`;
  } else if (expectedReturn < -threshold || risk > 0.15) {
    action = "sell";
    reasoning = `Negative expected return ${(expectedReturn * 100).toFixed(2)}% or high risk ${(risk * 100).toFixed(1)}%`;
  } else {
    action = "hold";
    reasoning = `Expected return ${(expectedReturn * 100).toFixed(2)}% within threshold`;
  }

  return {
    symbol: asset.symbol,
    action,
    confidence,
    targetPrice: asset.price * (1 + expectedReturn),
    stopLoss: asset.price * (1 - risk),
    quantumState,
    timestamp: Date.now(),
    reasoning,
  };
}

function getRegimeThreshold(regime: string): number {
  switch (regime) {
    case "bull":
      return 0.01;
    case "bear":
      return -0.005;
    case "crisis":
      return 0.03;
    default:
      return 0.015;
  }
}

export function filterHighConfidenceSignals(
  signals: TradeSignal[],
  minConfidence: number = 0.7
): TradeSignal[] {
  return signals.filter((s) => s.confidence >= minConfidence);
}

export function executeSignal(
  signal: TradeSignal,
  currentPosition?: { quantity: number; avgPrice: number }
): { success: boolean; message: string; action?: string } {
  if (signal.confidence < 0.5) {
    return { success: false, message: `Confidence too low: ${signal.confidence}` };
  }

  if (signal.action === "buy" && currentPosition) {
    return { success: false, message: "Position already exists" };
  }

  if (signal.action === "sell" && !currentPosition) {
    return { success: false, message: "No position to sell" };
  }

  return {
    success: true,
    message: `${signal.action.toUpperCase()} ${signal.symbol} @ $${signal.targetPrice.toFixed(2)}`,
    action: signal.action,
  };
}