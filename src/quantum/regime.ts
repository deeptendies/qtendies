// Market Regime Detector
// Uses quantum-inspired superposition states for market regime detection

export interface MarketRegime {
  state: "bull" | "bear" | "sideways" | "crisis" | "unknown";
  confidence: number;
  superpositionScore: number;
  timestamp: number;
}

export interface RegimeThresholds {
  crisisSuperposition: number;
  crisisVolatility: number;
  bullMomentum: number;
  bullVolatility: number;
  bearMomentum: number;
  bearVolatility: number;
}

const DEFAULT_THRESHOLDS: RegimeThresholds = {
  crisisSuperposition: 0.7,
  crisisVolatility: 0.02,
  bullMomentum: 0.02,
  bullVolatility: 0.015,
  bearMomentum: -0.02,
  bearVolatility: 0.015,
};

export function detectRegime(
  volatility: number,
  momentum: number,
  volumeRatio: number,
  thresholds: RegimeThresholds = DEFAULT_THRESHOLDS
): MarketRegime {
  const superpositionScore = calculateSuperposition(volatility, momentum, volumeRatio);
  const timestamp = Date.now();

  // Crisis detection: high superposition AND high volatility
  if (
    superpositionScore > thresholds.crisisSuperposition &&
    volatility > thresholds.crisisVolatility
  ) {
    return {
      state: "crisis",
      confidence: Math.min(superpositionScore, 0.95),
      superpositionScore,
      timestamp,
    };
  }

  // Bull market: positive momentum AND moderate volatility
  if (momentum > thresholds.bullMomentum && volatility < thresholds.bullVolatility) {
    const confidence = Math.min(0.5 + momentum * 10, 0.9);
    return { state: "bull", confidence, superpositionScore, timestamp };
  }

  // Bear market: negative momentum AND moderate volatility
  if (momentum < thresholds.bearMomentum && volatility < thresholds.bearVolatility) {
    const confidence = Math.min(0.5 + Math.abs(momentum) * 10, 0.9);
    return { state: "bear", confidence, superpositionScore, timestamp };
  }

  // Default: sideways market
  return { state: "sideways", confidence: 0.6, superpositionScore, timestamp };
}

function calculateSuperposition(volatility: number, momentum: number, volume: number): number {
  // Multiple states can coexist with different probabilities
  const stateVector = [
    Math.exp(-volatility * 10),     // Low volatility state
    Math.exp(-Math.abs(momentum) * 5), // Momentum state
    Math.min(volume, 3) / 3,          // Volume state
    0.5,                              // Base coherence
  ];

  // Calculate magnitude of superposition
  const magnitude = Math.sqrt(
    stateVector.reduce((sum, v) => sum + v * v, 0)
  );

  return Math.min(magnitude / 2, 1);
}

export function getRegimeFromPrices(prices: number[]): MarketRegime {
  if (prices.length < 20) {
    return { state: "unknown", confidence: 0, superpositionScore: 0, timestamp: Date.now() };
  }

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Calculate metrics
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance * 252); // Annualized

  // Momentum calculation
  const recent = prices.slice(-20);
  const older = prices.slice(-50, -20);
  const recentReturn = recent.length >= 20 ? (recent[19] - recent[0]) / recent[0] : 0;
  const olderReturn = older.length >= 20 ? (older[19] - older[0]) / older[0] : 0;
  const momentum = recentReturn - olderReturn;

  // Volume analysis (simplified)
  const volumeRatio = 1.0;

  return detectRegime(volatility, momentum, volumeRatio);
}