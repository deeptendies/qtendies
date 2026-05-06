// QTendies Quantum Agent - Entry Point
// Run with: npx tsx scratch/qtendies/src/index.ts

import { getAgent, resetAgent, type MarketData, type AssetData } from "./core.js";

const JOB_PATH = process.env.JOB_PATH || "/scratch/qtendies/JOB.md";
const CYCLE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let running = true;
let lastJobRead = 0;
const JOB_CHECK_INTERVAL_MS = 60000; // Check for job updates every 60 seconds

// Logging with levels (simulated pino-style)
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
const LOG_LEVELS: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "INFO";

function log(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLogLevel]) return;
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[${timestamp}] [${level}] [QuantumAgent] ${msg}${metaStr}`);
}

async function readJobUpdates(): Promise<string | null> {
  try {
    // In production, this would read from the actual JOB.md file
    // For now, return null as we're using the embedded version
    return null;
  } catch {
    return null;
  }
}

function generateMockMarketData(): MarketData {
  const assets: AssetData[] = [
    {
      symbol: "AAPL",
      price: 178.50 + Math.random() * 5,
      priceHistory: Array.from({ length: 50 }, (_, i) => 170 + i * 0.2 + Math.random() * 2),
      volume: Array.from({ length: 20 }, () => Math.random() * 10000000),
    },
    {
      symbol: "GOOGL",
      price: 140.25 + Math.random() * 3,
      priceHistory: Array.from({ length: 50 }, (_, i) => 135 + i * 0.15 + Math.random() * 2),
      volume: Array.from({ length: 20 }, () => Math.random() * 8000000),
    },
    {
      symbol: "MSFT",
      price: 415.80 + Math.random() * 4,
      priceHistory: Array.from({ length: 50 }, (_, i) => 400 + i * 0.3 + Math.random() * 3),
      volume: Array.from({ length: 20 }, () => Math.random() * 6000000),
    },
    {
      symbol: "BTC",
      price: 67000 + Math.random() * 2000,
      priceHistory: Array.from({ length: 50 }, (_, i) => 60000 + i * 300 + Math.random() * 5000),
      volume: Array.from({ length: 20 }, () => Math.random() * 50000000000),
    },
    {
      symbol: "ETH",
      price: 3450 + Math.random() * 100,
      priceHistory: Array.from({ length: 50 }, (_, i) => 3200 + i * 20 + Math.random() * 500),
      volume: Array.from({ length: 20 }, () => Math.random() * 20000000000),
    },
  ];

  return { assets, timestamp: Date.now() };
}

async function runAgentCycle(cycleNumber: number): Promise<void> {
  log("INFO", `=== Cycle ${cycleNumber} Starting ===`);

  // Generate mock market data
  const marketData = generateMockMarketData();
  log("INFO", `Market data loaded for ${marketData.assets.length} assets`);

  // Get the agent instance
  const agent = getAgent();

  // Run analysis
  const result = agent.analyze(marketData);

  // Log results
  log("INFO", `Regime: ${result.regime.state} (confidence: ${(result.regime.confidence * 100).toFixed(1)}%)`);
  log("INFO", `Superposition score: ${(result.regime.superpositionScore * 100).toFixed(1)}%`);
  log("INFO", `Signals generated: ${result.signals.length}`);

  for (const action of result.actions) {
    if (action.result.success) {
      log("INFO", `[TRADE] ${action.signal.action.toUpperCase()} ${action.signal.symbol} @ $${action.signal.targetPrice.toFixed(2)} | confidence: ${(action.signal.confidence * 100).toFixed(1)}%`);
    } else {
      log("WARN", `[SKIP] ${action.signal.symbol}: ${action.result.message}`);
    }
  }

  const portfolio = result.portfolio;
  log("INFO", `[PORTFOLIO] Value: $${portfolio.metrics.totalValue.toFixed(2)} | Sharpe: ${portfolio.metrics.sharpeRatio.toFixed(3)} | Vol: ${(portfolio.metrics.volatility * 100).toFixed(2)}%`);
  log("INFO", `[POSITIONS] ${portfolio.positions.length} active positions`);

  log("INFO", `=== Cycle ${cycleNumber} Complete ===`);
}
}

async function runAgentLoop(): Promise<void> {
  log("INFO", "Quantum Agentic Finance Agent starting...");
  log("INFO", `Job path: ${JOB_PATH}`);
  log("INFO", `Cycle interval: ${CYCLE_INTERVAL_MS / 1000 / 60} minutes`);

  let cycleNumber = 0;

  while (running) {
    const now = Date.now();

    // Check for job updates
    if (now - lastJobRead > JOB_CHECK_INTERVAL_MS) {
      const jobUpdate = await readJobUpdates();
      if (jobUpdate) {
        log("INFO", "[JOB] Task updated, re-reading JOB.md...");
        // Would reload job configuration here
      }
      lastJobRead = now;
    }

    try {
      cycleNumber++;
      await runAgentCycle(cycleNumber);
    } catch (error) {
      log("ERROR", `Error in agent cycle: ${error}`);
    }

    // Sleep until next cycle
    await new Promise((resolve) => setTimeout(resolve, CYCLE_INTERVAL_MS));
  }

  log("INFO", "Agent loop ending...");
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("QTENDIES QUANTUM AGENTIC FINANCE");
  console.log("=".repeat(60));

  // Initialize agent
  const agent = getAgent();
  log("INFO", `Agent initialized with config: ${JSON.stringify(agent.getConfig(), null, 2)}`);

  // Handle graceful shutdown
  const shutdown = async () => {
    log("INFO", "Shutdown signal received...");
    running = false;

    // Graceful cleanup: save state, flush logs
    log("INFO", "Flushing logs and saving agent state...");
    try {
      // Save portfolio state to disk (in production)
      // await saveAgentState(agent.getPortfolio());
    } catch (e) {
      log("ERROR", `Error during shutdown: ${e}`);
    }

    // Give loop time to finish current cycle
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log("INFO", "Shutdown complete.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Start the agent loop
  await runAgentLoop();

  resetAgent();
}

main().catch((err) => {
  console.error("[Agent] Fatal error:", err);
  process.exit(1);
});