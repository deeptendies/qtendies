// Quantum Coherence Engine
// Calculates quantum-inspired coherence metrics for financial time series

export interface CoherenceResult {
  coherence: number;
  entanglement: number;
  superpositionScore: number;
}

/**
 * Calculate quantum coherence metrics for financial time series
 * Coherence measures how well-correlated adjacent returns are
 * @param returns - Array of asset returns
 * @returns CoherenceResult with coherence, entanglement, and superposition scores
 */
export function calculateCoherence(returns: number[]): CoherenceResult {
  if (returns.length < 10) {
    return { coherence: 0.3, entanglement: 0, superpositionScore: 0 };
  }

  // Quantum coherence: measures how well-correlated adjacent returns are
  let coherence = 0;
  for (let i = 0; i < returns.length - 1; i++) {
    const correlation = returns[i] * returns[i + 1];
    coherence += Math.exp(-Math.abs(correlation));
  }
  coherence /= Math.max(returns.length - 1, 1);

  // Entanglement: cross-correlation between distant time points
  let entanglement = 0;
  const lag = Math.floor(returns.length / 4);
  for (let i = 0; i < returns.length - lag; i++) {
    entanglement += Math.abs(returns[i] * returns[i + lag]);
  }
  entanglement = Math.min(entanglement / Math.max(returns.length - lag, 1), 1);

  // Superposition score: combination of coherence and entanglement
  const superpositionScore = Math.min(
    Math.sqrt(coherence * coherence + entanglement * entanglement),
    1
  );

  return { coherence, entanglement, superpositionScore };
}

/**
 * Calculate the quantum state index for an asset
 * Maps market metrics to a point in 1024-dimensional Hilbert space
 */
export function calculateQuantumState(
  volatility: number,
  momentum: number,
  volumeRatio: number
): number {
  // Map to 1024-dimensional quantum state space
  const v = Math.min(volatility * 10, 1);
  const m = Math.min(Math.abs(momentum) * 5, 1) * (momentum >= 0 ? 1 : -1);
  const q = Math.min(volumeRatio / 3, 1);

  // Create state vector magnitude
  const magnitude = Math.sqrt(v * v + m * m + q * q);

  // Return normalized state index (0-1023)
  return Math.floor(Math.min(magnitude, 1) * 1024) % 1024;
}

/**
 * Calculate entanglement factor between two assets
 * Measures cross-correlation for portfolio diversification
 */
export function calculateEntanglementFactor(
  asset1Returns: number[],
  asset2Returns: number[]
): number {
  if (asset1Returns.length !== asset2Returns.length || asset1Returns.length < 5) {
    return 0;
  }

  let correlation = 0;
  const n = asset1Returns.length;
  for (let i = 0; i < n; i++) {
    correlation += asset1Returns[i] * asset2Returns[i];
  }
  correlation /= n;

  // Transform correlation to entanglement factor (0-1)
  return Math.min(Math.abs(correlation) * 5, 1);
}

/**
 * Calculate returns from price series
 */
export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) continue; // Skip division by zero
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

/**
 * Calculate annualized volatility from returns
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 252);
}

/**
 * Calculate momentum as difference between recent and older returns
 */
export function calculateMomentum(prices: number[]): number {
  if (prices.length < 50) return 0;
  const recent = prices.slice(-20);
  const older = prices.slice(-50, -20);
  if (recent.length < 20 || older.length < 20) return 0;
  const recentReturn = (recent[19] - recent[0]) / recent[0];
  const olderReturn = (older[19] - older[0]) / older[0];
  return recentReturn - olderReturn;
}

/**
 * Calculate volume ratio (recent avg / historical avg)
 */
export function calculateVolumeRatio(volumes: number[]): number {
  if (volumes.length < 20) return 1;
  const recentAvg = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const historicalAvg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  return recentAvg / Math.max(historicalAvg, 1);
}