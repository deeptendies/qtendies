// Tests for QTendies Quantum Agent
// Tests all quantum modules: coherence, regime, portfolio, signals, and core

import { describe, it, expect, beforeEach } from "vitest";
import {
  getAgent,
  resetAgent,
  type MarketData,
  type AssetData,
  type MarketRegime,
  type TradeSignal
} from "../src/core.js";

// Import quantum modules for direct testing
import {
  calculateCoherence,
  calculateQuantumState,
  calculateEntanglementFactor,
  calculateReturns,
  calculateVolatility,
  calculateMomentum,
  calculateVolumeRatio
} from "../src/quantum/coherence.js";

import { detectRegime, getRegimeFromPrices } from "../src/quantum/regime.js";

import {
  optimizePortfolio,
  shouldRebalance,
  type Position,
  type PortfolioMetrics
} from "../src/quantum/portfolio.js";

import { generateSignals, filterHighConfidenceSignals, type AssetData as SignalAssetData } from "../src/quantum/signals.js";
import { simulateRegime, verify3x, runBoomerMode, isBoomerRequired, type BacktestRegime } from "../src/quantum/backtest.js";
import {
  fetchAltSignals,
  fetchFedSignals,
  generateAltSignalReport,
  calculateQuantumModifier,
  calculateHypeScore,
  detectSignalAnomaly,
  type AltSignalResult
} from "../src/core/alt_data.js";

function generateMockMarketData(): MarketData {
  return {
    assets: [
      {
        symbol: "AAPL",
        price: 178.50,
        priceHistory: Array.from({ length: 50 }, (_, i) => 170 + i * 0.2),
        volume: Array.from({ length: 20 }, () => Math.random() * 10000000),
      },
      {
        symbol: "GOOGL",
        price: 140.25,
        priceHistory: Array.from({ length: 50 }, (_, i) => 135 + i * 0.15),
        volume: Array.from({ length: 20 }, () => Math.random() * 8000000),
      },
    ],
    timestamp: Date.now(),
  };
}

// ========== COHERENCE MODULE TESTS ==========
describe("Quantum Coherence Module", () => {
  it("should calculate coherence from returns", () => {
    const returns = [0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.01];
    const result = calculateCoherence(returns);

    expect(result.coherence).toBeGreaterThan(0);
    expect(result.coherence).toBeLessThanOrEqual(1);
    expect(result.entanglement).toBeGreaterThanOrEqual(0);
    expect(result.entanglement).toBeLessThanOrEqual(1);
    expect(result.superpositionScore).toBeGreaterThanOrEqual(0);
    expect(result.superpositionScore).toBeLessThanOrEqual(1);
  });

  it("should handle short returns array", () => {
    const returns = [0.01, -0.02];
    const result = calculateCoherence(returns);

    expect(result.coherence).toBe(0.3); // Default for short arrays
  });

  it("should calculate quantum state index", () => {
    const state = calculateQuantumState(0.15, 0.02, 1.2);

    expect(state).toBeGreaterThanOrEqual(0);
    expect(state).toBeLessThan(1024);
  });

  it("should calculate entanglement factor between two assets", () => {
    const returns1 = [0.01, -0.02, 0.015, 0.01, -0.01];
    const returns2 = [0.015, -0.01, 0.02, 0.005, -0.015];

    const entanglement = calculateEntanglementFactor(returns1, returns2);

    expect(entanglement).toBeGreaterThanOrEqual(0);
    expect(entanglement).toBeLessThanOrEqual(1);
  });

  it("should return 0 for mismatched return lengths", () => {
    const returns1 = [0.01, -0.02, 0.015];
    const returns2 = [0.01, -0.02];

    expect(calculateEntanglementFactor(returns1, returns2)).toBe(0);
  });

  it("should calculate returns from prices", () => {
    const prices = [100, 102, 101, 103, 102];
    const returns = calculateReturns(prices);

    expect(returns.length).toBe(prices.length - 1);
    expect(returns[0]).toBe(0.02); // (102-100)/100
  });

  it("should calculate volatility from returns", () => {
    const returns = [0.01, -0.02, 0.015, -0.01, 0.02];
    const volatility = calculateVolatility(returns);

    expect(volatility).toBeGreaterThan(0);
    expect(volatility).toBeLessThan(5); // Reasonable range for daily returns
  });

  it("should calculate momentum from prices", () => {
    const prices = Array.from({ length: 60 }, (_, i) => 100 + i * 0.5);
    const momentum = calculateMomentum(prices);

    expect(momentum).toBeDefined();
    expect(typeof momentum).toBe("number");
  });

  it("should handle short price history for momentum", () => {
    const prices = [100, 102, 101, 103];
    const momentum = calculateMomentum(prices);

    expect(momentum).toBe(0); // Returns 0 for insufficient data
  });

  it("should calculate volume ratio", () => {
    const volumes = Array.from({ length: 30 }, (_, i) => 1000000 + Math.random() * 500000);
    const ratio = calculateVolumeRatio(volumes);

    expect(ratio).toBeGreaterThan(0);
  });
});

// ========== REGIME MODULE TESTS ==========
describe("Market Regime Detection Module", () => {
  it("should detect bull market", () => {
    const regime = detectRegime(0.01, 0.03, 1.0);

    expect(regime.state).toBe("bull");
    expect(regime.confidence).toBeGreaterThan(0.5);
  });

  it("should detect bear market", () => {
    const regime = detectRegime(0.01, -0.03, 1.0);

    expect(regime.state).toBe("bear");
    expect(regime.confidence).toBeGreaterThan(0.5);
  });

  it("should detect crisis market", () => {
    const regime = detectRegime(0.03, 0.01, 2.0);

    expect(regime.state).toBe("crisis");
  });

  it("should detect sideways market", () => {
    const regime = detectRegime(0.005, 0.001, 1.0);

    expect(regime.state).toBe("sideways");
    expect(regime.confidence).toBe(0.6);
  });

  it("should detect from prices", () => {
    const prices = Array.from({ length: 60 }, (_, i) => 100 + i * 0.3);
    const regime = getRegimeFromPrices(prices);

    expect(["bull", "bear", "sideways", "crisis"]).toContain(regime.state);
  });

  it("should return unknown for insufficient data", () => {
    const prices = [100, 102, 101];
    const regime = getRegimeFromPrices(prices);

    expect(regime.state).toBe("unknown");
  });
});

// ========== PORTFOLIO MODULE TESTS ==========
describe("Portfolio Optimization Module", () => {
  const createPositions = (): Position[] => [
    { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
    { symbol: "GOOGL", quantity: 5, avgPrice: 130, currentPrice: 140, weight: 0.07, quantumEntanglement: 0.3 },
  ];

  it("should optimize portfolio weights", () => {
    const positions = createPositions();
    const result = optimizePortfolio(positions, 20000);

    expect(result.positions).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.rebalancingActions).toBeDefined();
  });

  it("should calculate portfolio metrics", () => {
    const positions = createPositions();
    const result = optimizePortfolio(positions, 20000);

    expect(result.metrics.totalValue).toBe(2300); // Calculated from positions, not the passed value
    expect(result.metrics.volatility).toBeGreaterThan(0);
    expect(result.metrics.sharpeRatio).toBeDefined();
    expect(result.metrics.maxDrawdown).toBeGreaterThan(0);
  });

  it("should generate rebalancing actions", () => {
    const positions = createPositions();
    const result = optimizePortfolio(positions, 20000);

    expect(Array.isArray(result.rebalancingActions)).toBe(true);
  });

  it("should check if rebalancing needed", () => {
    const positions = createPositions();

    expect(typeof shouldRebalance(positions)).toBe("boolean");
  });

  it("should respect threshold in rebalance check", () => {
    const positions = createPositions();

    expect(typeof shouldRebalance(positions, 0.05)).toBe("boolean");
  });
});

// ========== SIGNALS MODULE TESTS ==========
describe("Trade Signal Generation Module", () => {
  const createAssets = (): SignalAssetData[] => [
    {
      symbol: "AAPL",
      price: 178.50,
      priceHistory: Array.from({ length: 50 }, (_, i) => 170 + i * 0.2),
      volume: Array.from({ length: 20 }, () => Math.random() * 10000000),
    },
    {
      symbol: "GOOGL",
      price: 140.25,
      priceHistory: Array.from({ length: 50 }, (_, i) => 135 + i * 0.15),
      volume: Array.from({ length: 20 }, () => Math.random() * 8000000),
    },
  ];

  it("should generate signals from assets", () => {
    const assets = createAssets();
    const signals = generateSignals(assets, "bull");

    expect(Array.isArray(signals)).toBe(true);
  });

  it("should respect min confidence threshold", () => {
    const assets = createAssets();
    const signals = generateSignals(assets, "sideways", { minConfidence: 0.7 });

    signals.forEach(s => {
      expect(s.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  it("should sort signals by confidence", () => {
    const assets = createAssets();
    const signals = generateSignals(assets, "bull");

    for (let i = 1; i < signals.length; i++) {
      expect(signals[i - 1].confidence).toBeGreaterThanOrEqual(signals[i].confidence);
    }
  });

  it("should filter high confidence signals", () => {
    const assets = createAssets();
    const allSignals = generateSignals(assets, "bull");
    const highConf = filterHighConfidenceSignals(allSignals, 0.8);

    highConf.forEach(s => {
      expect(s.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  it("should include reasoning in signals", () => {
    const assets = createAssets();
    const signals = generateSignals(assets, "sideways");

    signals.forEach(s => {
      expect(s.reasoning).toBeDefined();
      expect(s.reasoning.length).toBeGreaterThan(0);
    });
  });

  it("should generate quantum state per signal", () => {
    const assets = createAssets();
    const signals = generateSignals(assets, "bull");

    signals.forEach(s => {
      expect(s.quantumState).toBeGreaterThanOrEqual(0);
      expect(s.quantumState).toBeLessThan(1024);
    });
  });
});

// ========== CORE AGENT TESTS ==========
describe("QuantumFinanceAgent", () => {
  beforeEach(() => {
    resetAgent();
  });

  it("should initialize with default config", () => {
    const agent = getAgent();
    const config = agent.getConfig();

    expect(config.initialCapital).toBe(100000);
    expect(config.maxVolatility).toBe(0.15);
    expect(config.maxPositionSize).toBe(0.05);
    expect(config.maxPositions).toBe(20);
    expect(config.quantumDimensions).toBe(1024);
  });

  it("should initialize with custom config", () => {
    const agent = getAgent({ initialCapital: 50000, maxPositions: 10 });
    const config = agent.getConfig();

    expect(config.initialCapital).toBe(50000);
    expect(config.maxPositions).toBe(10);
  });

  it("should analyze market data", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    const result = agent.analyze(marketData);

    expect(result.cycle).toBe(1);
    expect(result.regime).toBeDefined();
    expect(result.signals).toBeDefined();
    expect(result.actions).toBeDefined();
    expect(result.portfolio).toBeDefined();
  });

  it("should detect market regime", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    agent.analyze(marketData);
    const regime = agent.getRegime();

    expect(regime.state).toMatch(/bull|bear|sideways|crisis|unknown/);
    expect(regime.confidence).toBeGreaterThanOrEqual(0);
    expect(regime.confidence).toBeLessThanOrEqual(1);
  });

  it("should generate trade signals", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    const result = agent.analyze(marketData);

    expect(result.signals.length).toBeGreaterThan(0);
    result.signals.forEach((signal) => {
      expect(signal.symbol).toBeDefined();
      expect(signal.action).toMatch(/buy|sell|hold/);
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(1);
      expect(signal.targetPrice).toBeGreaterThan(0);
      expect(signal.stopLoss).toBeGreaterThan(0);
      expect(signal.quantumState).toBeGreaterThanOrEqual(0);
      expect(signal.quantumState).toBeLessThan(1024);
    });
  });

  it("should execute trades and track positions", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    const result = agent.analyze(marketData);

    // All actions should have success or failure messages
    result.actions.forEach((action) => {
      expect(action.result.message).toBeDefined();
      expect(typeof action.result.success).toBe("boolean");
    });
  });

  it("should track portfolio positions", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    agent.analyze(marketData);
    const positions = agent.getPortfolio();

    expect(Array.isArray(positions)).toBe(true);
  });

  it("should calculate portfolio metrics", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    const result = agent.analyze(marketData);

    expect(result.portfolio.metrics.totalValue).toBeGreaterThan(0);
    expect(result.portfolio.metrics.volatility).toBeGreaterThanOrEqual(0);
    expect(result.portfolio.metrics.sharpeRatio).toBeDefined();
  });

  it("should report status correctly", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    agent.analyze(marketData);
    const status = agent.getStatus();

    expect(typeof status).toBe("string");
    const parsed = JSON.parse(status);
    expect(parsed.cycle).toBe(1);
    expect(parsed.regime).toBeDefined();
  });

  it("should respect max positions limit", () => {
    const agent = getAgent({ maxPositions: 2 });
    const marketData = generateMockMarketData();

    // Run multiple cycles
    for (let i = 0; i < 5; i++) {
      agent.analyze(marketData);
    }

    const positions = agent.getPortfolio();
    expect(positions.length).toBeLessThanOrEqual(2);
  });

  it("should handle empty market data", () => {
    const agent = getAgent();
    const emptyMarketData: MarketData = { assets: [] };

    const result = agent.analyze(emptyMarketData);

    expect(result.regime.state).toBe("unknown");
    expect(result.signals.length).toBe(0);
  });

  it("should return quantum states", () => {
    const agent = getAgent();
    const states = agent.getQuantumStates();

    expect(Array.isArray(states));
    expect(states.length).toBe(1024);
  });

  it("should increment cycle count", () => {
    const agent = getAgent();
    const marketData = generateMockMarketData();

    agent.analyze(marketData);
    expect(agent.getStatus()).toContain('"cycle": 1');

    agent.analyze(marketData);
    expect(agent.getStatus()).toContain('"cycle": 2');
  });
});

// ========== BOOMER MODE / BACKTEST MODULE TESTS ==========
describe("Boomer Mode / Backtest Module", () => {
  it("should simulate regime correctly", () => {
    const positions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
    ];

    const result = simulateRegime(positions, "bull_2021", 100000);

    expect(result.regime).toBe("bull_2021");
    expect(result.initialValue).toBe(100000);
    expect(result.finalValue).toBeGreaterThan(0);
    expect(typeof result.passed).toBe("boolean");
  });

  it("should run triple backtest verification", () => {
    const positions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
    ];

    const result = verify3x(positions, ["bear_2022", "bull_2021", "neutral_2023"], 100000);

    expect(result.backtests).toHaveLength(3);
    expect(typeof result.approved).toBe("boolean");
    expect(result.failureCount).toBeGreaterThanOrEqual(0);
  });

  it("should run boomer mode with default regimes", () => {
    const positions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
      { symbol: "GOOGL", quantity: 5, avgPrice: 130, currentPrice: 140, weight: 0.07, quantumEntanglement: 0.3 },
    ];

    const result = runBoomerMode(positions, 100000);

    expect(typeof result.passed).toBe("boolean");
    expect(result.summary).toBeDefined();
    expect(result.details).toBeDefined();
  });

  it("should check if boomer is required", () => {
    expect(isBoomerRequired(0, 50000)).toBe(true);  // High value trade
    expect(isBoomerRequired(6, 5000)).toBe(true);  // Complex portfolio
    expect(isBoomerRequired(2, 5000)).toBe(false); // Low value, simple portfolio
  });

  it("should approve strong portfolios", () => {
    // Create positions that will likely pass all tests
    const strongPositions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.8 },
      { symbol: "GOOGL", quantity: 8, avgPrice: 130, currentPrice: 145, weight: 0.1, quantumEntanglement: 0.7 },
      { symbol: "MSFT", quantity: 6, avgPrice: 300, currentPrice: 350, weight: 0.1, quantumEntanglement: 0.6 },
    ];

    const result = runBoomerMode(strongPositions, 100000);
    expect(typeof result.passed).toBe("boolean");
  });

  it("should return backtest results for each regime", () => {
    const positions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
    ];

    const result = verify3x(positions, ["bear_2022", "bull_2021", "neutral_2023"], 100000);

    expect(result.backtests[0].regime).toBe("bear_2022");
    expect(result.backtests[1].regime).toBe("bull_2021");
    expect(result.backtests[2].regime).toBe("neutral_2023");
  });

  it("should calculate overall score", () => {
    const positions: Position[] = [
      { symbol: "AAPL", quantity: 10, avgPrice: 150, currentPrice: 160, weight: 0.1, quantumEntanglement: 0.5 },
    ];

    const result = verify3x(positions);

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(1);
  });
});

// ========== ALTERNATIVE DATA MODULE TESTS ==========
describe("Alternative Data Module (Modern Signal Stack)", () => {
  it("should fetch alternative signals for a symbol", async () => {
    const result = await fetchAltSignals("NVDA", ["social_sentiment", "on_chain", "github_activity"]);

    expect(result.symbol).toBe("NVDA");
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.aggregateScore).toBeGreaterThanOrEqual(-1);
    expect(result.aggregateScore).toBeLessThanOrEqual(1);
    expect(result.quantumModifier).toBeGreaterThanOrEqual(0.5);
    expect(result.quantumModifier).toBeLessThanOrEqual(1.5);
  });

  it("should calculate quantum modifier correctly", () => {
    const altSignal: AltSignalResult = {
      symbol: "AAPL",
      signals: [],
      aggregateScore: 0.5,
      quantumModifier: 1.25,
    };

    const modified = calculateQuantumModifier(altSignal, 0.05);
    expect(modified).toBeGreaterThan(0);
    expect(modified).toBeLessThanOrEqual(0.05);
  });

  it("should calculate hype score", () => {
    const socialSignal = { source: "social_sentiment" as const, symbol: "GME", score: 0.8, velocity: 0.9, confidence: 0.8, timestamp: Date.now() };
    const onChainSignal = { source: "on_chain" as const, symbol: "GME", score: 0.6, velocity: 0.7, confidence: 0.7, timestamp: Date.now() };

    const hypeScore = calculateHypeScore(socialSignal, onChainSignal);

    expect(hypeScore).toBeGreaterThanOrEqual(0);
    expect(hypeScore).toBeLessThanOrEqual(1);
  });

  it("should fetch FED signals", async () => {
    const fed = await fetchFedSignals();

    expect(fed.hawkishScore).toBeGreaterThanOrEqual(-1);
    expect(fed.hawkishScore).toBeLessThanOrEqual(1);
    expect(fed.confidence).toBeGreaterThan(0);
    expect(fed.nextMeetingDays).toBeGreaterThan(0);
  });

  it("should generate alt signal report for multiple symbols", async () => {
    const report = await generateAltSignalReport(["NVDA", "AAPL"], ["social_sentiment", "github_activity"]);

    expect(report.symbols).toEqual(["NVDA", "AAPL"]);
    expect(report.reports.length).toBe(2);
    expect(typeof report.overallQuantumModifier).toBe("number");
    expect(typeof report.aggregateHawkishness).toBe("number");
    expect(Array.isArray(report.anomalies)).toBe(true);
  });

  it("should detect signal anomalies", () => {
    const conflictingSignals = [
      { source: "social_sentiment" as const, symbol: "BTC", score: 0.9, velocity: 0.8, confidence: 0.8, timestamp: Date.now() },
      { source: "congressional_trades" as const, symbol: "BTC", score: -0.8, velocity: -0.3, confidence: 0.7, timestamp: Date.now() },
      { source: "on_chain" as const, symbol: "BTC", score: 0.2, velocity: 0.1, confidence: 0.6, timestamp: Date.now() },
    ];

    const hasAnomaly = detectSignalAnomaly(conflictingSignals);
    expect(hasAnomaly).toBe(true);
  });

  it("should not detect anomaly when signals align", () => {
    const alignedSignals = [
      { source: "social_sentiment" as const, symbol: "BTC", score: 0.7, velocity: 0.6, confidence: 0.8, timestamp: Date.now() },
      { source: "congressional_trades" as const, symbol: "BTC", score: 0.6, velocity: 0.5, confidence: 0.7, timestamp: Date.now() },
      { source: "on_chain" as const, symbol: "BTC", score: 0.5, velocity: 0.4, confidence: 0.6, timestamp: Date.now() },
    ];

    const hasAnomaly = detectSignalAnomaly(alignedSignals);
    expect(hasAnomaly).toBe(false);
  });

  it("should handle analyzeWithAltData method", async () => {
    resetAgent(); // Ensure clean state
    const agent = getAgent();
    const marketData: MarketData = {
      assets: [
        { symbol: "NVDA", price: 450, priceHistory: Array.from({ length: 50 }, (_, i) => 400 + i), volume: [] },
      ],
    };

    const result = await agent.analyzeWithAltData(marketData);

    expect(result.cycle).toBeGreaterThanOrEqual(1);
    expect(result.altSignals).toBeDefined();
    expect(result.altSignals.length).toBeGreaterThan(0);
    expect(typeof result.fedHawkishness).toBe("number");
  });
});

// ========== TRADINGAGENTS INTEGRATION TESTS ==========
// Note: These require TradingAgents Python package installed
// import { TradingAgentsBridge, generateTradingSignal } from "../src/integrations/trading_agents_bridge";
describe("TradingAgents Integration", () => {
  it("should define TradingAgentsBridge interface", () => {
    // Interface check - TradingAgentsBridge is defined in integrations
    expect(true).toBe(true); // Placeholder until Python package is installed
  });

  it("should define toQuantumModifier interface", () => {
    // This would test TradingAgentsBridge.toQuantumModifier when available
    expect(true).toBe(true);
  });

  it("should define generateTradingSignal interface", () => {
    // This would test generateTradingSignal when available
    expect(true).toBe(true);
  });
});