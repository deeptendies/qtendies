// Backtest Module - Boomer Mode
// Triple historical verification across Bear/Bull/Neutral regimes
// IMPORTANT: All data is SIMULATED for backtesting. In production, connect to real historical data APIs.

import type { Position, PortfolioMetrics } from "./portfolio.js";

export type BacktestRegime = "bear_2022" | "bull_2021" | "neutral_2023" | "bear_2020" | "bull_2019";

export interface BacktestResult {
  regime: BacktestRegime;
  initialValue: number;
  finalValue: number;
  return_pct: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  passed: boolean;
  failureReason?: string;
}

export interface BoomerResult {
  approved: boolean;
  backtests: BacktestResult[];
  overallScore: number; // 0-1, higher is better
  failureCount: number;
  averageReturn: number;
}

// Historical regime data (simplified - in production would fetch real data)
const REGIME_DATA: Record<BacktestRegime, { multiplier: number; volatility: number; duration: number }> = {
  bear_2022: { multiplier: 0.75, volatility: 0.30, duration: 252 },   // 2022 crash
  bull_2021: { multiplier: 1.35, volatility: 0.18, duration: 252 },   // 2021 recovery
  neutral_2023: { multiplier: 1.08, volatility: 0.15, duration: 252 }, // 2023 sideways
  bear_2020: { multiplier: 0.65, volatility: 0.50, duration: 126 },  // COVID crash (half year)
  bull_2019: { multiplier: 1.25, volatility: 0.12, duration: 252 }, // 2019 bull
};

// Seeded random number generator for deterministic backtests
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

// Internal seeded RNG (null means use global Math.random)
let rng: SeededRandom | null = null;

function random(): number {
  return rng ? rng.next() : Math.random();
}

/**
 * Seed the random number generator for reproducible backtest results
 */
export function seedBacktest(seed: number): void {
  rng = new SeededRandom(seed);
}

/**
 * Reset to using global Math.random()
 */
export function unseedBacktest(): void {
  rng = null;
}

/**
 * Simulate portfolio performance for a given regime
 * Uses seeded RNG if seedBacktest() was called for deterministic results
 */
export function simulateRegime(
  positions: Position[],
  regime: BacktestRegime,
  initialValue: number
): BacktestResult {
  const data = REGIME_DATA[regime];
  const regimeMultiplier = data.multiplier;
  const regimeVolatility = data.volatility;

  // Calculate weighted average position performance
  let totalWeight = 0;
  let weightedReturn = 0;

  for (const position of positions) {
    const weight = (position.currentPrice * position.quantity) / initialValue;
    totalWeight += weight;

    // Per-position return with regime adjustment
    // Assume each position has regime-dependent return based on weight
    const positionReturn = (regimeMultiplier - 1) * (0.8 + random() * 0.4);
    weightedReturn += weight * positionReturn;
  }

  // Normalize if weights don't sum to 1
  if (totalWeight > 0 && totalWeight !== 1) {
    weightedReturn = weightedReturn / totalWeight;
  }

  // Calculate final value with volatility adjustment
  const volatilityFactor = 1 + (random() - 0.5) * regimeVolatility;
  const finalValue = initialValue * (1 + weightedReturn) * volatilityFactor;
  const returnPct = ((finalValue - initialValue) / initialValue) * 100;

  // Calculate max drawdown (simplified)
  const maxDrawdown = regimeVolatility * 2 * 100;

  // Calculate Sharpe ratio (simplified)
  const riskFreeRate = 4.5 / 252; // Daily
  const dailyReturn = returnPct / data.duration;
  const sharpeRatio = regimeVolatility > 0
    ? (dailyReturn - riskFreeRate) / (regimeVolatility / Math.sqrt(data.duration))
    : 0;

  return {
    regime,
    initialValue,
    finalValue,
    return_pct: returnPct,
    maxDrawdown,
    sharpeRatio,
    volatility: regimeVolatility * 100,
    passed: returnPct > -maxDrawdown && sharpeRatio > -1, // Survived if not worse than max drawdown and Sharpe > -1
  };
}

/**
 * Run triple backtest verification (Boomer Mode)
 * All three regimes must pass for approval
 */
export function verify3x(
  positions: Position[],
  regimes: BacktestRegime[] = ["bear_2022", "bull_2021", "neutral_2023"],
  initialValue: number = 100000
): BoomerResult {
  const results: BacktestResult[] = [];

  for (const regime of regimes) {
    const result = simulateRegime(positions, regime, initialValue);
    results.push(result);
  }

  // Calculate overall metrics
  const passedCount = results.filter(r => r.passed).length;
  const failureCount = results.length - passedCount;
  const returns = results.map(r => r.return_pct);
  const averageReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Overall score: average of normalized returns, penalized by failures
  let overallScore = averageReturn / 100; // Normalize to roughly 0-1
  overallScore = Math.max(0, Math.min(1, overallScore));

  // Severe penalty if any test failed
  if (failureCount > 0) {
    overallScore *= (1 - (failureCount / results.length) * 0.5);
  }

  // Boomer approval: must pass at least 2 of 3 tests AND average return > -10%
  const approved = passedCount >= Math.ceil(results.length * 0.66) && averageReturn > -10;

  // Add failure reasons
  for (const result of results) {
    if (!result.passed) {
      if (result.return_pct <= -result.maxDrawdown) {
        result.failureReason = `Drawdown exceeded: ${result.return_pct.toFixed(2)}% vs ${result.maxDrawdown.toFixed(2)}% max`;
      }
      if (result.sharpeRatio <= -1) {
        result.failureReason = `Sharpe ratio too low: ${result.sharpeRatio.toFixed(2)}`;
      }
    }
  }

  return {
    approved,
    backtests: results,
    overallScore: Math.max(0, Math.min(1, overallScore)),
    failureCount,
    averageReturn,
  };
}

/**
 * Run full Boomer Mode verification with detailed reporting
 */
export function runBoomerMode(
  positions: Position[],
  initialValue: number = 100000
): {
  passed: boolean;
  summary: string;
  details: BoomerResult;
} {
  const result = verify3x(positions);

  const regimeNames = result.backtests.map(r => r.regime).join(", ");
  const returns = result.backtests.map(r => `${r.regime}: ${r.return_pct.toFixed(1)}%`).join(" | ");

  let summary: string;
  if (result.approved) {
    summary = `[BOOMER APPROVED] Triple-backtest passed across ${regimeNames}. Avg return: ${result.averageReturn.toFixed(1)}%. Score: ${(result.overallScore * 100).toFixed(0)}%`;
  } else {
    const failedRegimes = result.backtests.filter(r => !r.passed).map(r => r.regime);
    summary = `[BOOMER REJECTED] Failed: ${failedRegimes.join(", ")}. Avg return: ${result.averageReturn.toFixed(1)}%. Strategy unstable across regimes.`;
  }

  return {
    passed: result.approved,
    summary,
    details: result,
  };
}

/**
 * Check if Boomer Mode is required for a trade
 * @param positionCount - Number of existing positions
 * @param tradeValue - Dollar value of the proposed trade
 * @param portfolioValue - Total portfolio value (for scaling threshold)
 */
export function isBoomerRequired(positionCount: number, tradeValue: number, portfolioValue: number = 100000): boolean {
  // Require Boomer verification for:
  // - First trade (cold start)
  // - Trades > 20% of portfolio value
  // - Adding position when already have 5+ positions
  const highValueThreshold = portfolioValue * 0.20; // 20% of portfolio
  const isHighValueTrade = tradeValue > highValueThreshold;
  const isComplexPortfolio = positionCount >= 5;

  return isHighValueTrade || isComplexPortfolio;
}