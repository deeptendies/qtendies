# QTendies - Quantum Agentic Finance

**QTendies** is a production-ready quantum-inspired agentic finance platform that enables autonomous portfolio optimization through quantum computational concepts. It operates as a Claude Code skill, allowing AI agents to perform sophisticated financial analysis.

## What is QTendies?

QTendies represents a convergence of **quantum computing concepts** and **quantitative finance** — not because quantum computers are used (though that is the roadmap), but because the mathematical frameworks borrowed from quantum mechanics — Hilbert spaces, entanglement, superposition, coherence — provide powerful abstractions for modeling financial markets.

### Why This Matters

Traditional finance treats assets as independent classical objects with static correlations. QTendies breaks from this by:

| Traditional Approach | QTendies Quantum-Inspired Approach |
|---------------------|-----------------------------------|
| Single regime assumption | Superposition of multiple regimes simultaneously |
| Fixed correlation matrices | Entanglement model that captures non-linear dependencies |
| Point estimates for confidence | Quantum probability amplitudes with coherence measures |
| Backtest against one historical period | Boomer Mode triple-backtest across Bear/Bull/Neutral regimes |

**The result**: More robust portfolio construction that doesn't overfit to a single market regime and better captures the uncertainty inherent in markets.

### Core Innovation: 1024-Dimensional Hilbert Space

Each asset is mapped to a point in a 1024-dimensional quantum state space. This high-dimensional representation allows:
- Complex correlations between assets that classical 2D/3D visualizations miss
- Quantum-inspired optimization that considers entanglement between positions
- Coherence metrics that measure regime stability over time

## Key Features

| Feature | Description |
|---------|-------------|
| **Quantum State Mapping** | Assets represented as 1024-dim vectors with coherence/entanglement metrics |
| **Market Regime Detection** | Real-time bull/bear/sideways/crisis classification with confidence scoring |
| **Entanglement-Weighted Portfolio** | Correlation-aware position sizing that reduces portfolio risk |
| **Boomer Mode** | Mandatory triple backtest (Bear 2022, Bull 2021, Neutral 2023) before any production trade |
| **Modern Signal Stack** | Alternative data: social sentiment, on-chain whale flows, congressional trades, GitHub dev activity, FED hawkishness |
| **TradingAgents Integration** | Multi-agent LLM analysis for fundamental sentiment, technicals, news, and bull/bear debate |

## Quick Start

```bash
# Install dependencies
npm install

# Run the agent (5-minute cycle loop)
npm start

# Run tests
npm test

# Type check
npm run lint
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Agent                             │
│         (invokes /qtendies or "use qtendies skill")             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               QuantumFinanceAgent (src/core.ts)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Market Data │→ │ Regime Detect│→ │ Generate Trade Signals │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│         │                                      │                │
│         │              ┌──────────────────────┘                │
│         ▼              ▼                                         │
│  ┌─────────────────────────────┐                               │
│  │   Portfolio Optimization    │                               │
│  │   (Entanglement-Weighted)   │                               │
│  └─────────────────────────────┘                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Boomer Mode │  │Modern Signal │  │ TradingAgents Bridge   │ │
│  │  (Backtest) │  │   Stack      │  │ (Multi-Agent LLM)      │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Modern Signal Stack (Alternative Data)

QTendies includes a **Modern Signal Stack** that provides high-entropy alternative data signals:

| Source | Signal Type | Production Integration |
|--------|-------------|----------------------|
| `social_sentiment` | Twitter/Reddit momentum | Twitter API v2, PRAW |
| `on_chain` | Whale wallet movements | Glassnode, Nansen, Dune |
| `congressional_trades` | Capitol trading filings | CapitolHolders, Senate/House |
| `github_activity` | Dev energy / commit velocity | GitHub API v3 |
| `fed_sentiment` | Hawkish/Dovish scoring | LLM parsing of FED transcripts |

These signals act as **external potentials in the quantum Hamiltonian**, boosting or reducing position weights:

```typescript
// Quantum modifier range: 0.5 (bearish) to 1.5 (bullish)
const adjustedWeight = baseWeight * signal.quantumModifier;
```

## TradingAgents Integration

**TradingAgents** (by TauricResearch) is a multi-agent LLM framework thatqtendies integrates with for enhanced fundamental analysis.

### How the Integration Works

```
1. QTendies receives trading request
2. TradingAgents Bridge spawns Python subprocess
3. TradingAgents runs multi-agent analysis:
   ├── Analyst Team (4 agents)
   │   ├── Fundamentals Analyst → intrinsic value, red flags
   │   ├── Sentiment Analyst → social media, short-term mood
   │   ├── News Analyst → impact indicators, global events
   │   └── Technical Analyst → pattern recognition, indicators
   │
   ├── Researcher Team (2 agents)
   │   ├── Bull Researcher → bullish thesis
   │   └── Bear Researcher → bearish thesis
   │   └── Multiple debate rounds (configurable)
   │
   └── Trader Agent → Final decision (BUY/SELL/HOLD)
       └── Risk Management → Position sizing, VaR

4. Bridge receives structured decision
5. QTendies converts to quantum modifier:
   ├── BUY → 1.0-1.4× boost (confidence-scaled)
   ├── SELL → 0.6-1.0× reduction (confidence-scaled)
   └── HOLD → ~1.0 neutral
6. Quantum modifier applied to portfolio weights
7. Boomer Mode triple-backtest validates
8. Trade executed (or rejected)
```

### Why TradingAgents + QTendies?

TradingAgents provides **fundamental analysis** through LLM multi-agent debate. QTendies provides **quantum-inspired portfolio optimization**. Together:

- TradingAgents' bull/bear debate catches thesis flaws
- QTendies' entanglement weights prevent concentration risk
- Boomer Mode ensures strategy survives across regimes
- Modern Signal Stack provides real-time alternative data

### Usage Example

```typescript
import { TradingAgentsBridge } from "./src/integrations/trading_agents_bridge";

const bridge = new TradingAgentsBridge({
  pythonPath: "python",
  tradingAgentsPath: "/path/to/TradingAgents",
  deepThinkModel: "gpt-4.1",
  maxDebateRounds: 2,
});

const decision = await bridge.analyze("NVDA", "2024-05-10");

console.log(`Action: ${decision.action}`);
console.log(`Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
console.log(`Position Size: ${(decision.positionSize * 100).toFixed(1)}%`);
console.log(`Reasoning: ${decision.reasoning}`);

// Use with QTendies
const quantumModifier = TradingAgentsBridge.toQuantumModifier(decision);
```

### Requirements

- Python 3.10+
- TradingAgents: `pip install tradingagents`
- API keys: `OPENAI_API_KEY` (or compatible LLM)

## Usage Example

```typescript
import { getAgent, type MarketData } from "./src/core.ts";

const agent = getAgent({
  initialCapital: 100000,
  maxVolatility: 0.15,
  maxPositionSize: 0.05,
});

const marketData: MarketData = {
  assets: [
    {
      symbol: "AAPL",
      price: 178.50,
      priceHistory: Array.from({ length: 50 }, (_, i) => 170 + i * 0.2),
      volume: Array.from({ length: 20 }, () => Math.random() * 10000000)
    }
  ]
};

const result = agent.analyze(marketData);
console.log(`Regime: ${result.regime.state}`);
console.log(`Signals: ${result.signals.length}`);
console.log(`Portfolio: $${result.portfolio.metrics.totalValue}`);
```

## CLI Usage

```bash
# Start the agent (continuous 5-minute cycles)
npm start

# Run tests (58 tests covering all modules)
npm test

# Type check
npm run lint

# Set log level
LOG_LEVEL=DEBUG npm start
```

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `initialCapital` | $100,000 | Starting capital |
| `maxVolatility` | 15% | Maximum portfolio volatility |
| `maxPositionSize` | 5% | Maximum single position |
| `maxPositions` | 20 | Maximum number of positions |
| `riskFreeRate` | 4.5% | Annual risk-free rate |
| `quantumDimensions` | 1024 | Hilbert space dimensions |

## Documentation

- [CLAUDE.md](CLAUDE.md) - Complete skill interface definition
- [docs/SKILLS.md](docs/SKILLS.md) - Detailed capability documentation
- [docs/ROADMAP_1_TO_100.md](docs/ROADMAP_1_TO_100.md) - Future roadmap (v1.0 → v3.0)
- [docs/CODE_REVIEW.md](docs/CODE_REVIEW.md) - Production readiness audit
- [docs/INTEGRATION_TRADING_AGENTS.md](docs/INTEGRATION_TRADING_AGENTS.md) - TradingAgents integration guide

## Roadmap

| Version | Milestone |
|---------|-----------|
| v1.0 | Core quantum finance engine, Boomer Mode, Signal Stack |
| v1.1 | Real API integrations (Yahoo Finance, Alpaca) |
| v2.0 | Qiskit integration, actual QPU execution, QAOA solver |
| v3.0 | Multi-agent swarm (Ingestor + Solver + Critic), QGAN synthetic data |

## License

MIT