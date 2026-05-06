# QTendies - Quantum Agentic Finance Skill

## Overview

QTendies is a **quantum-inspired agentic finance** skill that combines advanced portfolio optimization with autonomous agent capabilities. It operates within the meow orchestrator and can be invoked as a standalone Claude Code skill.

## Architecture

### Core Modules

| Module | File | Responsibility |
|--------|------|----------------|
| **Agent** | `src/core.ts` | Main `QuantumFinanceAgent` class |
| **Coherence** | `src/quantum/coherence.ts` | Quantum state calculations, entanglement factors |
| **Regime** | `src/quantum/regime.ts` | Market regime detection (bull/bear/sideways/crisis) |
| **Portfolio** | `src/quantum/portfolio.ts` | Entanglement-weighted portfolio optimization |
| **Signals** | `src/quantum/signals.ts` | Trade signal generation with confidence scoring |
| **Alternative** | `src/core/alt_data.ts` | **Modern Stack**: Sentiment, On-Chain, Congressional data ingestion |
| **Backtest** | `src/quantum/backtest.ts` | **Boomer Mode**: Triple historical verification (Bear/Bull/Neutral) |
| **Backtest** | `src/quantum/backtest.ts` | **Boomer Mode**: Triple historical verification (Bear/Bull/Neutral) |

## Capabilities

### 1. Quantum-Inspired Analysis

```typescript
import { calculateCoherence, calculateQuantumState } from "./quantum/coherence";

// Calculate quantum coherence of returns
const returns = [0.01, -0.02, 0.015, ...];
const { coherence, entanglement, superpositionScore } = calculateCoherence(returns);

// Map asset to quantum state (0-1023)
const state = calculateQuantumState(volatility, momentum, volumeRatio);
```

### 2. Market Regime Detection

```typescript
import { detectRegime } from "./quantum/regime";

const regime = detectRegime(volatility, momentum, volumeRatio);
// Returns: { state: "bull" | "bear" | "sideways" | "crisis", confidence: 0.0-1.0, superpositionScore: 0.0-1.0 }
```

**Regime Detection Rules:**
- **Crisis**: superposition > 0.7 AND volatility > 2%
- **Bull**: momentum > 2% AND volatility < 1.5%
- **Bear**: momentum < -2% AND volatility < 1.5%
- **Sideways**: default

### 3. Portfolio Optimization

```typescript
import { optimizePortfolio, shouldRebalance } from "./quantum/portfolio";

// Optimize with entanglement-weighted positions
const result = optimizePortfolio(positions, totalValue, targetVolatility);

// Check if rebalancing needed
if (shouldRebalance(positions, 0.02)) { ... }
```

### 4. Trade Signal Generation

```typescript
import { generateSignals, type AssetData } from "./quantum/signals";

const assets: AssetData[] = [
  { symbol: "AAPL", price: 178.50, priceHistory: [...], volume: [...] },
  ...
];

const signals = generateSignals(assets, "bull", { minConfidence: 0.5 });
// Returns TradeSignal[] sorted by confidence
```

### 5. Triple-Backtest (Boomer Mode)

```typescript
import { verify3x, type BacktestRegime } from "./quantum/backtest";

const regimes: BacktestRegime[] = ["bear_2022", "bull_2021", "neutral_2023"];
const isBoomerApproved = verify3x(portfolio, regimes);

if (!isBoomerApproved) {
  console.log("Failed Boomer Mode: Strategy rejected due to instability across regimes.");
}
```

### 6. Modern Signal Orchestration

```typescript
import { fetchAltSignals, type SignalSource } from "./core/alt_data";

const sources: SignalSource[] = ["social_sentiment", "congressional_trades", "github_activity"];
const signals = await fetchAltSignals("NVDA", sources);

// Integration with Quantum Optimizer
// The 'Alt-Signals' act as external potentials in the Quantum Hamiltonian
```

## Agent Usage

```typescript
import { getAgent, resetAgent, type MarketData } from "./core";

// Get singleton agent instance
const agent = getAgent({ initialCapital: 100000 });

// Analyze market data
const marketData: MarketData = {
  assets: [
    { symbol: "AAPL", price: 178.50, priceHistory: [...], volume: [...] }
  ]
};

const result = agent.analyze(marketData);
console.log(result.regime);    // Market regime info
console.log(result.signals);   // Trade signals
console.log(result.portfolio); // Portfolio state

// Get status
console.log(agent.getStatus()); // JSON string with cycle, value, positions, etc.
```

## Configuration

Default configuration (can be overridden):

```typescript
{
  initialCapital: 100000,      // Starting capital in USD
  maxVolatility: 0.15,         // 15% max portfolio volatility
  maxPositionSize: 0.05,       // 5% max per position
  maxPositions: 20,            // Max 20 positions
  riskFreeRate: 0.045,         // 4.5% annual risk-free rate
  quantumDimensions: 1024      // 1024-dim quantum state space
}
```

## Skill Invocation

### Via Claude Code
```
/qtendies analyze portfolio for AAPL, GOOGL, MSFT, BTC
```

### Via Meow Orchestrator
```json
{
  "task": "Run qtendies quantum finance analysis",
  "runtime": "subagent",
  "cwd": "/home/node/.openclaw/workspace/shared/scratch/qtendies",
  "agentId": "qtendies"
}
```

## CLI Usage

```bash
# Start the agent
npm start

# Run tests
npm test

# Type check
npm run lint
```

## Risk Parameters (Non-Negotiable)

- Max portfolio volatility: **15%**
- Max single position size: **5%**
- Max total positions: **20**
- Risk-free rate: **4.5% annual**
- Quantum state dimensions: **1024**
- Min trade confidence: **50%**
- **Boomer Mode**: Mandatory Triple-Backtest (3x) verification for all production trades.

## Output Format

```json
{
  "cycle": 1,
  "regime": {
    "state": "bull",
    "confidence": 0.75,
    "superpositionScore": 0.62,
    "timestamp": 1700000000000
  },
  "signals": [
    {
      "symbol": "AAPL",
      "action": "buy",
      "confidence": 0.72,
      "targetPrice": 182.50,
      "stopLoss": 168.50,
      "quantumState": 512,
      "timestamp": 1700000000000,
      "reasoning": "Positive expected return 1.2% with confidence 72%"
    }
  ],
  "portfolio": {
    "positions": [
      {
        "symbol": "AAPL",
        "quantity": 2.74,
        "avgPrice": 182.50,
        "currentPrice": 182.50,
        "weight": 0.05,
        "quantumEntanglement": 0.5
      }
    ],
    "metrics": {
      "totalValue": 100000,
      "volatility": 0.12,
      "sharpeRatio": 1.15,
      "maxDrawdown": 0.24
    }
  },
  "timestamp": 1700000000000
}
```