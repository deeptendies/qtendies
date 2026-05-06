# QTendies - Quantum Agentic Finance Skill

A **quantum-inspired agentic finance** Claude Skill for portfolio optimization, market regime detection, and autonomous trading operations.

## Skill Overview

**Name:** `qtendies`  
**Version:** 1.0.0  
**Type:** Claude Code Skill (Agentic Finance)  
**Invoke:** `/qtendies` or "use the qtendies skill"

## Capabilities

### 1. Quantum-Inspired Portfolio Optimization
- 1024-dimensional quantum state space for asset representation
- Entanglement-based correlation modeling across portfolio assets
- Quantum-weighted asset allocation with risk-adjusted returns

### 2. Market Regime Detection
- Real-time detection: `bull` | `bear` | `sideways` | `crisis`
- Superposition scoring (0-1) for regime confidence
- Automatic threshold adjustment based on market conditions

### 3. Trade Signal Generation
- Coherence-based confidence scoring
- Regime-aware thresholds for buy/sell/hold decisions
- Quantum state tracking per asset (0-1023 index)

### 4. Risk Management
- Max portfolio volatility: 15%
- Max single position: 5% of portfolio
- Max positions: 20
- VaR quantum sampling support

## Usage

### Basic Analysis
```
Use qtendies to analyze my tech portfolio (AAPL, GOOGL, MSFT) for risk-adjusted optimization.
```

### Portfolio Optimization
```
Run quantum portfolio optimization on my current holdings with a $100k capital base.
```

### Market Regime Detection
```
What's the current market regime and what positions should I adjust?
```

## Configuration

The skill operates with these defaults (override via config):
```json
{
  "initialCapital": 100000,
  "maxVolatility": 0.15,
  "maxPositionSize": 0.05,
  "maxPositions": 20,
  "riskFreeRate": 0.045,
  "quantumDimensions": 1024
}
```

## Architecture

```
src/
├── core.ts           # QuantumFinanceAgent main class
└── quantum/
    ├── coherence.ts  # Quantum state calculations
    ├── regime.ts     # Market regime detection
    ├── portfolio.ts  # Portfolio optimization
    └── signals.ts    # Trade signal generation
```

## Meow Orchestrator Integration

This skill can be spawned as a subagent via meow orchestrator:

```
task: "Run qtendies quantum finance analysis"
runtime: subagent
cwd: /home/node/.openclaw/workspace/shared/scratch/qtendies
```

## Output Format

The skill produces structured output:
```json
{
  "cycle": 1,
  "regime": { "state": "bull", "confidence": 0.75, "superpositionScore": 0.6 },
  "signals": [
    { "symbol": "AAPL", "action": "buy", "confidence": 0.72, "targetPrice": 182.50 }
  ],
  "portfolio": {
    "positions": [...],
    "metrics": { "totalValue": 100000, "sharpeRatio": 1.2, "volatility": 0.12 }
  }
}
```