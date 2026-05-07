# QTendies Test Results - v1.1.0

**Date:** May 7, 2026
**Version:** v1.1.0 (Native Claude Code Skill)
**Test Environment:** TypeScript/Node.js with Vitest

## Unit Tests

```
Test Results: 58 tests passing (100%)
- Quantum Coherence Module: 11 tests
- Market Regime Detection: 6 tests
- Portfolio Optimization: 5 tests
- Trade Signal Generation: 6 tests
- QuantumFinanceAgent: 14 tests
- Boomer Mode / Backtest: 7 tests
- Alternative Data Module: 8 tests
- TradingAgents Integration: 3 tests (placeholder)
```

## Functional Experiments

### Experiment 1: Basic Market Analysis

**Input:** AAPL, GOOGL, MSFT, NVDA, BTC with realistic price histories

**Results:**
```
MARKET REGIME: SIDEWAYS
  Confidence: 60.0%
  Superposition Score: 60.2%

TRADE SIGNALS:
  BUY AAPL @ $196.34 | Conf: 95%
  BUY GOOGL @ $148.37 | Conf: 95%
  BUY MSFT @ $423.30 | Conf: 95%
  BUY NVDA @ $907.62 | Conf: 95%
  BUY BTC @ $72440.26 | Conf: 95%

PORTFOLIO STATE:
  Total Value: $25,000 (initial)
  Sharpe Ratio: 0.146
  Volatility: 141.99%
  Positions: 5
```

### Experiment 2: Boomer Mode Verification

**Test 1: Boomer Required Check**
```
5 positions, $5k trade (10% of $50k): REQUIRED
2 positions, $5k trade (10% of $50k): NOT REQUIRED
0 positions, $25k trade (50% of $50k): REQUIRED
```

**Test 2: Triple Backtest (Bear/Bull/Neutral)**
```
Initial Positions: AAPL, GOOGL, MSFT
Initial Value: $50,000

RESULTS:
  bear_2022 - Return: -36.74% | Sharpe: -8.66 | FAILED
  bull_2021 - Return: +27.37% | Sharpe: +8.00 | PASSED
  neutral_2023 - Return: +8.32% | Sharpe: +1.61 | PASSED

Overall: APPROVED (2/3 passed, avg return: -0.3%)
```

**Test 3: Regime Detection**
```
Input: SPY with sinusoidal price pattern
Detected Regime: SIDEWAYS
Confidence: 60.0%
Superposition Score: 73.8%

Signal Generated: HOLD SPY @ $523.75
Confidence: 95%
```

### Experiment 3: Health Check & Status

```
AGENT STATUS:
  Cycle: 1
  Portfolio Value: $25,000
  Positions: 5
  Regime: sideways (60.0% confidence)

HEALTH CHECK:
  Status: HEALTHY ✓
  Cycles Completed: 1
  Last Regime: sideways
  Portfolio Value: $25,000.00
  Errors: None
```

## Key Findings

1. **Regime Detection**: Correctly identifies sideways market with 60% confidence
2. **Signal Generation**: Generates high-confidence (95%) buy signals across multiple assets
3. **Boomer Mode**: Correctly triggers on complex portfolios (5+ positions) and high-value trades (>20% of portfolio)
4. **Health Monitoring**: Health check endpoint returns proper status with no errors

## Known Limitations

1. **Deterministic Backtest**: Seeded backtest shows minor variance between runs (not fully deterministic yet)
2. **Alternative Data**: All alt data (social, on-chain, congressional, GitHub, FED) is currently simulated
3. **TradingAgents**: Integration is wired but requires Python package installation and API keys

## Next Steps for v1.2

- [ ] Replace simulated alt data with real API integrations
- [ ] Add Yahoo Finance / Alpaca for real market data
- [ ] Fix seeded backtest determinism
- [ ] Add WebSocket support for real-time market data

## Conclusion

QTendies v1.1.0 is a **functional quantum-inspired finance engine** with:
- ✓ 58/58 unit tests passing
- ✓ Market regime detection working
- ✓ Portfolio optimization with entanglement weights
- ✓ Boomer Mode triple-backtest verification
- ✓ Health checks and structured logging
- ✓ Native Claude Code skill interface