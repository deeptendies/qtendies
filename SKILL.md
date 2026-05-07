---
name: qtendies
description: Quantum-inspired agentic finance for portfolio optimization, market regime detection, and autonomous trading operations
category: finance
---

# QTendies - Quantum Agentic Finance Claude Skill

A **quantum-inspired agentic finance** Claude Skill for portfolio optimization, market regime detection, and autonomous trading operations. Designed to be invoked by Claude Code agents for financial analysis tasks.

## Skill Interface

**Name:** `qtendies`
**Invocation:** `/qtendies [task]` or "use qtendies to analyze..."
**Runtime:** TypeScript/Node.js with ESM modules

## What is QTendies?

QTendies is an **agentic quantum finance platform** that maps financial market analysis onto quantum-inspired computational models. It represents assets as quantum states in a 1024-dimensional Hilbert space, enabling sophisticated portfolio optimization that accounts for:

- **Quantum Coherence**: Measures correlation strength between adjacent time periods
- **Entanglement**: Cross-asset correlations for diversification modeling
- **Superposition**: Multiple simultaneous market regime probabilities

### Why Quantum-Inspired Finance?

Traditional portfolio theory (Markowitz) treats assets as classical entities. QTendies extends this by:

1. **High-Dimensional State Space**: Assets mapped to 1024-dimensional vectors capture complex correlations classical models miss
2. **Regime Superposition**: Market conditions exist in superposition until collapsed by observation, giving probabilistic regime confidence
3. **Entanglement-Based Weighting**: Correlated assets share risk, allowing better diversification than independent weighting schemes

## Capabilities

### Core Features

| Feature | Description |
|---------|-------------|
| **Quantum State Mapping** | Assets → 1024-dim Hilbert space vectors |
| **Market Regime Detection** | bull/bear/sideways/crisis with confidence scores |
| **Coherence Metrics** | Time-series correlation strength |
| **Entanglement Weights** | Cross-asset correlation modeling |
| **Trade Signals** | Confidence-scored buy/sell/hold with quantum state |
| **Boomer Mode** | Triple historical backtest (Bear/Bull/Neutral) before trade execution |
| **Modern Signal Stack** | Alternative data: social, on-chain, congressional, GitHub, FED |
| **TradingAgents Bridge** | Multi-agent LLM analysis via TauricResearch/TradingAgents |

### Risk Parameters (Hardcoded Defaults)

- Max portfolio volatility: **15%**
- Max position size: **5%**
- Max positions: **20**
- Risk-free rate: **4.5%**
- Quantum dimensions: **1024**
- Min trade confidence: **50%**

## Usage by Claude Code Agent

### Direct Skill Invocation

```
/qtendies analyze my portfolio for AAPL, GOOGL, MSFT risk-adjusted optimization
```

### Natural Language Usage

When a user asks about portfolio analysis, market regime, or trading decisions, the agent can invoke qtendies:

```
Use qtendies to run quantum portfolio optimization on my tech holdings with $100k capital
```

## Architecture

```
qtendies/
├── CLAUDE.md          # This file - Skill interface definition
├── src/
│   ├── core.ts        # QuantumFinanceAgent (main class)
│   ├── index.ts       # CLI entry point
│   ├── core/
│   │   └── alt_data.ts     # Modern Signal Stack (alternative data)
│   ├── quantum/
│   │   ├── coherence.ts    # Quantum state calculations
│   │   ├── regime.ts       # Market regime detection
│   │   ├── portfolio.ts    # Portfolio optimization
│   │   ├── signals.ts      # Trade signal generation
│   │   └── backtest.ts     # Boomer Mode triple-backtest
│   └── integrations/
│       └── trading_agents_bridge.ts  # TradingAgents LLM integration
├── tests/
│   └── agent.test.ts  # 58 tests covering all modules
└── docs/
    ├── SKILLS.md      # Detailed capability docs
    └── INTEGRATION_TRADING_AGENTS.md  # TradingAgents integration guide
```

## TradingAgents Integration

QTendies integrates with [TradingAgents](https://github.com/TauricResearch/TradingAgents) to leverage multi-agent LLM analysis.

### How It Works

```
Claude Code Agent
    ↓ (analyze request)
QTendies QuantumFinanceAgent
    ↓ (TradingAgents bridge)
TradingAgents Multi-Agent Framework (Python)
    ├── Analyst Team → Fundamentals, Sentiment, News, Technical analysis
    ├── Researcher Team → Bull/Bear debate rounds
    ├── Trader Agent → Final decision
    └── Risk Management → Position sizing, VaR
    ↓ (decision returned)
QTendies converts to quantum modifier (0.6-1.4)
    ↓ (boosts/reduces signal confidence)
Portfolio optimization
```

### Integration Points

```typescript
import { TradingAgentsBridge, generateTradingSignal } from "./integrations/trading_agents_bridge";

const bridge = new TradingAgentsBridge({
  pythonPath: "python",
  tradingAgentsPath: "/path/to/TradingAgents",
  deepThinkModel: "gpt-4.1",
});

const decision = await bridge.analyze("NVDA", "2024-05-10");

// Convert TradingAgents decision to quantum modifier
// BUY → 1.1-1.4 boost | SELL → 0.6-0.9 reduction | HOLD → ~1.0 neutral
const quantumModifier = TradingAgentsBridge.toQuantumModifier(decision);

// Generate boosted signal
const signal = generateTradingSignal(decision, baseConfidence);
```

### Output Mapping

| TradingAgents | QTendies Quantum Effect |
|---------------|------------------------|
| BUY | 1.0-1.4× quantum modifier boost |
| SELL | 0.6-1.0× quantum modifier reduction |
| HOLD | 1.0 neutral (confidence-weighted) |
| decision.confidence | Maps to quantum state confidence |

### Requirements for TradingAgents

- Python 3.10+
- TradingAgents: `pip install tradingagents`
- API keys: `OPENAI_API_KEY` (or compatible LLM)

## Quick Start for Claude Code Agent

```typescript
import { getAgent, type MarketData } from "./src/core.js";

// Initialize agent
const agent = getAgent();

// Prepare market data
const marketData: MarketData = {
  assets: [{
    symbol: "AAPL",
    price: 178.50,
    priceHistory: Array.from({ length: 50 }, (_, i) => 170 + i * 0.2),
    volume: Array.from({ length: 20 }, () => Math.random() * 10000000)
  }]
};

// Run analysis
const result = agent.analyze(marketData);

// Output
console.log(`Regime: ${result.regime.state} (${(result.regime.confidence * 100).toFixed(1)}%)`);
console.log(`Signals: ${result.signals.map(s => `${s.action} ${s.symbol}`).join(", ")}`);
console.log(`Portfolio: $${result.portfolio.metrics.totalValue.toFixed(2)}`);
```

## CLI Usage

```bash
npm install
npm start        # Run agent loop (5-min cycles)
npm test         # Run 58 tests
npm run lint     # TypeScript check
```

## Output Format

```json
{
  "cycle": 1,
  "regime": {
    "state": "bull",
    "confidence": 0.75,
    "superpositionScore": 0.62
  },
  "signals": [
    {
      "symbol": "AAPL",
      "action": "buy",
      "confidence": 0.72,
      "targetPrice": 182.50,
      "stopLoss": 168.50,
      "quantumState": 512,
      "reasoning": "..."
    }
  ],
  "portfolio": {
    "positions": [...],
    "metrics": {
      "totalValue": 100000,
      "volatility": 0.12,
      "sharpeRatio": 1.15,
      "maxDrawdown": 0.24
    }
  }
}
```

## Production Readiness

- **58 tests passing** covering all modules
- **Health checks**: `agent.healthCheck()` method
- **Structured logging**: DEBUG/INFO/WARN/ERROR levels via `LOG_LEVEL` env var
- **Graceful shutdown**: SIGINT/SIGTERM handling with state flush
- **TypeScript**: Full type coverage with strict mode
- **Deterministic backtests**: `seedBacktest(n)` for reproducible results