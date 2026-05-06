# QTendies - Quantum Agentic Finance

**QTendies** is a quantum-inspired agentic finance skill for portfolio optimization, market regime detection, and autonomous trading operations. It operates as a Claude Code skill within the meow orchestrator.

## Quick Start

```bash
# Install dependencies
npm install

# Run the agent
npm start

# Run tests
npm test
```

## Project Origin

This project evolved from the [legacy deeptendies library](https://github.com/deeptendies/legacy-deeptendies-library), reimagined as an **agentic quantum finance** system that bridges classical portfolio theory with quantum-inspired computational methods.

## Core Features

| Feature | Description |
|---------|-------------|
| **Quantum State Space** | 1024-dimensional Hilbert space representation for assets |
| **Market Regime Detection** | Superposition-based regime classification |
| **Coherence Metrics** | Quantum-inspired time-series analysis |
| **Entanglement Weights** | Cross-asset correlation modeling |
| **Trade Signals** | Confidence-scored buy/sell/hold recommendations |

## Architecture

```
src/
├── core.ts           # QuantumFinanceAgent main class
└── quantum/
    ├── coherence.ts  # Quantum state calculations (coherence, entanglement)
    ├── regime.ts     # Market regime detection
    ├── portfolio.ts  # Portfolio optimization
    └── signals.ts    # Trade signal generation
```

## Usage Example

```typescript
import { getAgent, type MarketData } from "./src/core.ts";

const agent = getAgent();

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
console.log(`Portfolio Value: $${result.portfolio.metrics.totalValue}`);
```

## Meow Orchestrator Integration

Invoke via sessions_spawn:

```
task: "Run qtendies quantum finance analysis"
runtime: subagent
cwd: /home/node/.openclaw/workspace/shared/scratch/qtendies
```

## Configuration

Default risk parameters (non-negotiable):
- Max volatility: 15%
- Max position size: 5%
- Max positions: 20
- Risk-free rate: 4.5%
- Quantum dimensions: 1024

See `config/agent.json` for full configuration options.

## Documentation

- `CLAUDE.md` - Skill interface definition
- `docs/SKILLS.md` - Detailed capability documentation
- `docs/context.md` - Project context and evolution
- `docs/ROADMAP_0_TO_1.md` - Initial development roadmap
- `docs/ROADMAP_1_TO_100.md` - Future capabilities