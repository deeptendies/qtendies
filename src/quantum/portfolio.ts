// Portfolio Optimizer
// Quantum-inspired portfolio optimization with entanglement modeling

export interface PortfolioMetrics {
  totalValue: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  weight: number;
  quantumEntanglement: number;
}

export interface OptimizedPortfolio {
  positions: Position[];
  metrics: PortfolioMetrics;
  rebalancingActions: RebalanceAction[];
}

export interface RebalanceAction {
  symbol: string;
  action: "buy" | "sell" | "hold";
  quantity: number;
  reason: string;
}

// Shared configuration constants (exported for use by other modules)
export const MAX_POSITION_SIZE = 0.05; // 5% max per position
export const MAX_PORTFOLIO_VOL = 0.15; // 15% max portfolio volatility
export const ASSUMED_ASSET_VOLATILITY = 0.2; // 20% assumed annual volatility per asset
export const RISK_FREE_RATE = 0.045; // 4.5% annual risk-free rate

export function optimizePortfolio(
  positions: Position[],
  totalValue: number,
  targetVolatility?: number
): OptimizedPortfolio {
  const maxVol = targetVolatility || MAX_PORTFOLIO_VOL;
  const rebalancingActions: RebalanceAction[] = [];

  // Calculate current weights
  let currentTotalValue = positions.reduce(
    (sum, p) => sum + p.currentPrice * p.quantity,
    0
  );

  // Calculate target weights using quantum-inspired optimization
  const targetWeights = calculateQuantumWeights(positions, currentTotalValue);

  // Rebalance
  const optimizedPositions = positions.map((position) => {
    const currentWeight =
      (position.currentPrice * position.quantity) / currentTotalValue;
    const targetWeight = targetWeights[position.symbol] || 0;

    if (Math.abs(currentWeight - targetWeight) > 0.001) {
      const diff = targetWeight - currentWeight;
      const valueDiff = diff * currentTotalValue;
      const quantityChange = valueDiff / position.currentPrice;

      if (diff > 0.001) {
        rebalancingActions.push({
          symbol: position.symbol,
          action: "buy",
          quantity: Math.abs(quantityChange),
          reason: `Increase weight from ${(currentWeight * 100).toFixed(1)}% to ${(targetWeight * 100).toFixed(1)}%`,
        });
      } else if (diff < -0.001) {
        rebalancingActions.push({
          symbol: position.symbol,
          action: "sell",
          quantity: Math.abs(quantityChange),
          reason: `Decrease weight from ${(currentWeight * 100).toFixed(1)}% to ${(targetWeight * 100).toFixed(1)}%`,
        });
      }

      return {
        ...position,
        weight: targetWeight,
      };
    }

    return { ...position, weight: currentWeight };
  });

  // Calculate portfolio metrics
  const metrics = calculatePortfolioMetrics(optimizedPositions, currentTotalValue);

  return {
    positions: optimizedPositions,
    metrics,
    rebalancingActions,
  };
}

function calculateQuantumWeights(
  positions: Position[],
  totalValue: number
): Record<string, number> {
  const weights: Record<string, number> = {};
  let totalWeight = 0;

  for (const position of positions) {
    // Quantum-inspired weight calculation
    // Higher entanglement = higher weight (correlation provides stability)
    const baseWeight =
      (position.currentPrice * position.quantity) / totalValue;
    const quantumBoost = 1 + position.quantumEntanglement * 0.1;
    const weight = Math.min(baseWeight * quantumBoost, MAX_POSITION_SIZE);

    weights[position.symbol] = weight;
    totalWeight += weight;
  }

  // Normalize weights
  if (totalWeight > 1) {
    const factor = 1 / totalWeight;
    for (const symbol in weights) {
      weights[symbol] *= factor;
    }
  }

  return weights;
}

function calculatePortfolioMetrics(
  positions: Position[],
  totalValue: number
): PortfolioMetrics {
  // Calculate weighted volatility (simplified)
  let weightedVariance = 0;
  for (const position of positions) {
    const weight = (position.currentPrice * position.quantity) / totalValue;
    // Assume 20% annual volatility per asset for demo
    weightedVariance += Math.pow(weight * ASSUMED_ASSET_VOLATILITY, 2);
  }
  const volatility = Math.sqrt(weightedVariance) * Math.sqrt(252);

  // Calculate Sharpe ratio
  const riskFreeRate = RISK_FREE_RATE;
  const portfolioReturn = estimateReturn(positions, totalValue);
  const excessReturn = portfolioReturn - riskFreeRate;
  const sharpe = volatility > 0 ? excessReturn / volatility : 0;

  // Max drawdown (simplified)
  const maxDrawdown = volatility * 2; // Approximate

  return {
    totalValue,
    volatility,
    sharpeRatio: sharpe,
    maxDrawdown,
  };
}

function estimateReturn(positions: Position[], totalValue: number): number {
  let weightedReturn = 0;
  for (const position of positions) {
    const weight = (position.currentPrice * position.quantity) / totalValue;
    // Use momentum as return proxy (base 0.1% daily return)
    weightedReturn += weight * 0.001;
  }
  return weightedReturn * 252; // Annualize
}

export function shouldRebalance(
  positions: Position[],
  threshold: number = 0.02
): boolean {
  let totalValue = positions.reduce(
    (sum, p) => sum + p.currentPrice * p.quantity,
    0
  );

  for (const position of positions) {
    const currentWeight =
      (position.currentPrice * position.quantity) / totalValue;
    if (Math.abs(currentWeight - position.weight) > threshold) {
      return true;
    }
  }

  return false;
}