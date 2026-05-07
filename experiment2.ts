import { getAgent, resetAgent, runBoomerMode, isBoomerRequired, seedBacktest, verify3x } from './src/core.ts';
import { type Position } from './src/quantum/portfolio.ts';

console.log('=== QTENDIES BOOMER MODE EXPERIMENT ===\n');

// Test 1: Check if Boomer is required
console.log('1. BOOMER REQUIRED CHECK:');
console.log('   5 positions, $5k trade (10% of $50k):', isBoomerRequired(5, 5000, 50000) ? 'YES' : 'NO');
console.log('   2 positions, $5k trade (10% of $50k):', isBoomerRequired(2, 5000, 50000) ? 'YES' : 'NO');
console.log('   0 positions, $25k trade (50% of $50k):', isBoomerRequired(0, 25000, 50000) ? 'YES' : 'NO');

console.log('\n2. DETERMINISTIC BACKTEST (seeded):');

// Create test positions
const positions: Position[] = [
  { symbol: 'AAPL', quantity: 10, avgPrice: 185, currentPrice: 189, weight: 0.2, quantumEntanglement: 0.5 },
  { symbol: 'GOOGL', quantity: 15, avgPrice: 138, currentPrice: 141, weight: 0.2, quantumEntanglement: 0.4 },
  { symbol: 'MSFT', quantity: 5, avgPrice: 410, currentPrice: 415, weight: 0.1, quantumEntanglement: 0.3 },
];

// Run deterministic backtest with seed
seedBacktest(42);
const result1 = verify3x(positions, ['bear_2022', 'bull_2021', 'neutral_2023'], 50000);
console.log('   Seed 42, Run 1 - Approved:', result1.approved, '| Avg Return:', result1.averageReturn.toFixed(2) + '%');

// Run again with same seed - should get same results
const result2 = verify3x(positions, ['bear_2022', 'bull_2021', 'neutral_2023'], 50000);
console.log('   Seed 42, Run 2 - Approved:', result2.approved, '| Avg Return:', result2.averageReturn.toFixed(2) + '%');

// Verify determinism
console.log('   Deterministic:', result1.overallScore === result2.overallScore && result1.averageReturn === result2.averageReturn ? 'YES ✓' : 'NO ✗');

console.log('\n3. BOOMER MODE FULL VERIFICATION:');
const boomer = runBoomerMode(positions, 50000);
console.log('   Passed:', boomer.passed ? 'YES ✓' : 'NO ✗');
console.log('   Summary:', boomer.summary);
console.log('   Details:');
for (const bt of boomer.details.backtests) {
  console.log('     ', bt.regime, '- Return:', bt.return_pct.toFixed(2) + '%', '| Sharpe:', bt.sharpeRatio.toFixed(2), '| Passed:', bt.passed ? 'YES' : 'NO');
}

console.log('\n4. MARKET REGIME DETECTION:');
const agent = getAgent();
const marketData = {
  assets: [
    {
      symbol: 'SPY',
      price: 520.50,
      priceHistory: Array.from({ length: 50 }, (_, i) => 500 + i * 0.4 + Math.sin(i / 5) * 2),
      volume: Array.from({ length: 20 }, () => 80000000 + Math.random() * 20000000),
    },
  ],
};

const result = agent.analyze(marketData);
console.log('   Detected Regime:', result.regime.state.toUpperCase());
console.log('   Confidence:', (result.regime.confidence * 100).toFixed(1) + '%');
console.log('   Superposition Score:', (result.regime.superpositionScore * 100).toFixed(1) + '%');

console.log('\n5. SIGNAL GENERATION:');
for (const signal of result.signals) {
  console.log('  ', signal.action.toUpperCase(), signal.symbol);
  console.log('    Price: $' + signal.targetPrice.toFixed(2), '| Confidence:', (signal.confidence * 100).toFixed(0) + '%');
  console.log('    Stop Loss: $' + signal.stopLoss.toFixed(2));
  console.log('    Quantum State:', signal.quantumState, '(0-1023 Hilbert space index)');
}

console.log('\n6. HEALTH CHECK:');
const health = agent.healthCheck();
console.log('   Status:', health.status);
console.log('   Last Cycle:', health.lastCycle);
console.log('   Portfolio Value: $' + health.portfolioValue.toFixed(2));
console.log('   Errors:', health.errors.length === 0 ? 'None' : health.errors.join(', '));

console.log('\n=== ALL EXPERIMENTS COMPLETE ===');