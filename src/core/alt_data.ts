// Alternative Data Module - Modern Signal Stack
// High-entropy alternative data ingestion: Social, On-Chain, Congressional, GitHub, FED

export type SignalSource =
  | "social_sentiment"
  | "on_chain"
  | "congressional_trades"
  | "github_activity"
  | "fed_sentiment";

export type SentimentScore = {
  source: SignalSource;
  symbol: string;
  score: number;      // -1 to 1 (fear to bullish)
  velocity: number;   // Rate of change
  confidence: number; // 0 to 1
  timestamp: number;
  rawData?: unknown;
};

export type AltSignalResult = {
  symbol: string;
  signals: SentimentScore[];
  aggregateScore: number;
  quantumModifier: number; // 0.5 to 1.5, influences portfolio weights
  hawkishScore?: number;   // FED sentiment: -1 dovish to +1 hawkish
  whaleScore?: number;     // On-chain whale activity
  devEnergy?: number;      // GitHub commit velocity
  hypeVelocity?: number;   // Social momentum
};

// Social Sentiment Analysis (Simulated)
async function fetchSocialSentiment(symbol: string): Promise<SentimentScore> {
  // In production: integrate Twitter API v2, Reddit PRAW, FinTwit scraping
  // For now: simulate with realistic values

  const mockHypeVelocity = (Math.random() - 0.3) * 0.5; // Slight positive bias
  const baseScore = mockHypeVelocity * 0.7 + (Math.random() - 0.5) * 0.3;

  return {
    source: "social_sentiment",
    symbol,
    score: Math.max(-1, Math.min(1, baseScore)),
    velocity: mockHypeVelocity,
    confidence: 0.6 + Math.random() * 0.3,
    timestamp: Date.now(),
  };
}

// On-Chain / Whale Monitoring (Simulated)
async function fetchOnChainSignals(symbol: string): Promise<SentimentScore> {
  // In production: integrate Glassnode API, WhaleAlert, Nansen, Dune Analytics
  // Simulate whale wallet movements and stablecoin flows

  const whaleSignal = (Math.random() - 0.4) * 0.6; // Slight bullish bias
  const largeTransferDetected = Math.random() > 0.7;

  return {
    source: "on_chain",
    symbol,
    score: largeTransferDetected ? whaleSignal * 1.5 : whaleSignal,
    velocity: largeTransferDetected ? 0.8 : 0.2,
    confidence: largeTransferDetected ? 0.85 : 0.55,
    timestamp: Date.now(),
    rawData: {
      largeTransfers24h: largeTransferDetected ? Math.floor(Math.random() * 10) + 1 : 0,
      stablecoinFlow: (Math.random() - 0.5) * 1000000,
      exchangeOutflow: Math.random() > 0.5,
    },
  };
}

// Congressional / Insider Trading (Simulated)
async function fetchCongressionalSignals(symbol: string): Promise<SentimentScore> {
  // In production: parse CapitolHolders, Senate/House quarterly filings
  // Track insider buy/sell ratios

  const insiderBias = (Math.random() - 0.3) * 0.5;
  const recentFilings = Math.floor(Math.random() * 5) + 1;
  const buyRatio = Math.random() * 0.6 + 0.2; // 20-80% buys

  return {
    source: "congressional_trades",
    symbol,
    score: insiderBias,
    velocity: buyRatio > 0.5 ? 0.4 : -0.2,
    confidence: 0.7 + (recentFilings / 10),
    timestamp: Date.now(),
    rawData: {
      recentFilings,
      buyRatio,
      mostRecentTrade: buyRatio > 0.5 ? "BUY" : "SELL",
      congressmanCount: Math.floor(Math.random() * 3) + 1,
    },
  };
}

// GitHub / Dev Energy (Simulated)
async function fetchGitHubSignals(symbol: string): Promise<SentimentScore> {
  // In production: integrate GitHub API v3, GitLab API
  // Track commit velocity, PR growth, contributor count

  const devVelocity = (Math.random() - 0.2) * 0.6; // Slight positive bias
  const commits7d = Math.floor(Math.random() * 500) + 50;
  const prGrowthRate = (Math.random() - 0.3) * 0.4;

  return {
    source: "github_activity",
    symbol,
    score: devVelocity * 0.6 + prGrowthRate * 0.4,
    velocity: prGrowthRate,
    confidence: 0.65 + Math.random() * 0.25,
    timestamp: Date.now(),
    rawData: {
      commits7d,
      openPRs: Math.floor(Math.random() * 50) + 10,
      contributors: Math.floor(Math.random() * 30) + 5,
      starsGrowth: Math.random() * 20,
    },
  };
}

// FED / FOMC Sentiment Parsing (Simulated)
async function fetchFedSentiment(): Promise<SentimentScore & { hawkishScore: number }> {
  // In production: integrate FED speech transcripts, parse via LLM
  // Score speakers on Hawkish (1) to Dovish (-1) scale

  const fedScore = (Math.random() - 0.5) * 1.2; // Range roughly -0.6 to 0.6
  const recentSpeeches = Math.floor(Math.random() * 3) + 1;

  return {
    source: "fed_sentiment",
    symbol: "FED",
    score: fedScore,
    velocity: fedScore > 0 ? 0.3 : -0.2,
    confidence: 0.7 + Math.random() * 0.2,
    timestamp: Date.now(),
    hawkishScore: fedScore,
    rawData: {
      recentSpeeches,
      lastSpeechTone: fedScore > 0 ? "hawkish" : "dovish",
      nextMeetingDelta: Math.random() * 30, // days until next FOMC
    },
  };
}

/**
 * Fetch alternative signals for a symbol from multiple sources
 */
export async function fetchAltSignals(
  symbol: string,
  sources: SignalSource[] = ["social_sentiment", "on_chain", "congressional_trades", "github_activity"]
): Promise<AltSignalResult> {
  const signals: SentimentScore[] = [];

  // Fetch all requested sources in parallel
  const fetchPromises: Promise<SentimentScore>[] = [];

  if (sources.includes("social_sentiment")) {
    fetchPromises.push(fetchSocialSentiment(symbol));
  }
  if (sources.includes("on_chain")) {
    fetchPromises.push(fetchOnChainSignals(symbol));
  }
  if (sources.includes("congressional_trades")) {
    fetchPromises.push(fetchCongressionalSignals(symbol));
  }
  if (sources.includes("github_activity")) {
    fetchPromises.push(fetchGitHubSignals(symbol));
  }

  const results = await Promise.allSettled(fetchPromises);

  // Aggregate successful results
  for (const result of results) {
    if (result.status === "fulfilled") {
      signals.push(result.value);
    }
  }

  // Calculate aggregate score (weighted by confidence)
  let totalWeight = 0;
  let weightedSum = 0;

  for (const signal of signals) {
    const weight = signal.confidence;
    weightedSum += signal.score * weight;
    totalWeight += weight;
  }

  const aggregateScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Calculate quantum modifier (maps signal to quantum weight adjustment)
  // Range: 0.5 (extremely negative/contrarian) to 1.5 (extremely positive/momentum)
  const quantumModifier = 1 + aggregateScore * 0.5;

  // Extract specific scores
  const whaleSignal = signals.find(s => s.source === "on_chain");
  const devSignal = signals.find(s => s.source === "github_activity");
  const socialSignal = signals.find(s => s.source === "social_sentiment");

  return {
    symbol,
    signals,
    aggregateScore,
    quantumModifier: Math.max(0.5, Math.min(1.5, quantumModifier)),
    whaleScore: whaleSignal?.score,
    devEnergy: devSignal?.velocity,
    hypeVelocity: socialSignal?.velocity,
  };
}

/**
 * Fetch FED sentiment separately (not symbol-specific)
 */
export async function fetchFedSignals(): Promise<{
  hawkishScore: number;
  confidence: number;
  nextMeetingDays: number;
}> {
  const fedSignal = await fetchFedSentiment();

  return {
    hawkishScore: fedSignal.hawkishScore ?? 0,
    confidence: fedSignal.confidence,
    nextMeetingDays: (fedSignal.rawData as { nextMeetingDelta?: number })?.nextMeetingDelta ?? 30,
  };
}

/**
 * Calculate quantum Hamiltonian modifier from alternative signals
 * These signals act as "external potentials" in the QUBO formulation
 */
export function calculateQuantumModifier(
  altSignals: AltSignalResult,
  baseWeight: number
): number {
  // Apply quantum modifier to base portfolio weight
  // If quantumModifier > 1, increase weight (bullish signal)
  // If quantumModifier < 1, decrease weight (bearish signal)
  const adjustedWeight = baseWeight * altSignals.quantumModifier;

  // Cap at max position size (5%)
  return Math.min(adjustedWeight, 0.05);
}

/**
 * Score hype velocity for meme-stock detection
 * Returns 0-1 where 1 = extremely overhyped (danger zone)
 */
export function calculateHypeScore(
  socialSignal: SentimentScore,
  onChainSignal: SentimentScore
): number {
  const combinedVelocity = (socialSignal.velocity + onChainSignal.velocity) / 2;
  const combinedScore = (socialSignal.score + onChainSignal.score) / 2;

  // High velocity + high score = overhyped
  const hypeScore = Math.min(1, Math.abs(combinedVelocity) * 2 + Math.max(0, combinedScore) * 0.5);

  return hypeScore;
}

/**
 * Check if signal indicates potential regime change
 * Used to trigger more aggressive Boomer Mode verification
 */
export function detectSignalAnomaly(signals: SentimentScore[]): boolean {
  if (signals.length < 3) return false;

  // Check for conflicting signals (high variance)
  const scores = signals.map(s => s.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

  // High variance across sources = anomaly
  return variance > 0.3;
}

/**
 * Generate combined alternative signal report
 */
export async function generateAltSignalReport(
  symbols: string[],
  sources: SignalSource[] = ["social_sentiment", "on_chain", "congressional_trades", "github_activity"]
): Promise<{
  symbols: string[];
  reports: AltSignalResult[];
  aggregateHawkishness: number;
  overallQuantumModifier: number;
  anomalies: string[];
}> {
  const reports: AltSignalResult[] = [];
  const anomalies: string[] = [];

  // Fetch signals for all symbols
  for (const symbol of symbols) {
    const report = await fetchAltSignals(symbol, sources);
    reports.push(report);

    // Check for anomalies
    if (detectSignalAnomaly(report.signals)) {
      anomalies.push(symbol);
    }
  }

  // Calculate overall quantum modifier
  const avgModifier = reports.reduce((sum, r) => sum + r.quantumModifier, 0) / reports.length;

  // Note: FED signals are global, not per-symbol
  const fedSignals = await fetchFedSignals();

  return {
    symbols,
    reports,
    aggregateHawkishness: fedSignals.hawkishScore,
    overallQuantumModifier: avgModifier,
    anomalies,
  };
}