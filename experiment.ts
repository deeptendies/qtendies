import { getAgent, resetAgent } from './src/core.ts';

// Reset for clean state
resetAgent();

const agent = getAgent();

// Generate realistic mock market data
const marketData = {
  assets: [
    {
      symbol: 'AAPL',
      price: 189.30,
      priceHistory: Array.from({ length: 50 }, (_, i) => 175 + i * 0.3 + (Math.random() - 0.5) * 2),
      volume: Array.from({ length: 20 }, () => 50000000 + Math.random() * 20000000),
    },
    {
      symbol: 'GOOGL',
      price: 141.80,
      priceHistory: Array.from({ length: 50 }, (_, i) => 135 + i * 0.2 + (Math.random() - 0.5) * 1.5),
      volume: Array.from({ length: 20 }, () => 25000000 + Math.random() * 10000000),
    },
    {
      symbol: 'MSFT',
      price: 415.50,
      priceHistory: Array.from({ length: 50 }, (_, i) => 395 + i * 0.4 + (Math.random() - 0.5) * 3),
      volume: Array.from({ length: 20 }, () => 30000000 + Math.random() * 10000000),
    },
    {
      symbol: 'NVDA',
      price: 875.20,
      priceHistory: Array.from({ length: 50 }, (_, i) => 750 + i * 2.5 + (Math.random() - 0.5) * 10),
      volume: Array.from({ length: 20 }, () => 45000000 + Math.random() * 20000000),
    },
    {
      symbol: 'BTC',
      price: 67500,
      priceHistory: Array.from({ length: 50 }, (_, i) => 58000 + i * 380 + (Math.random() - 0.5) * 2000),
      volume: Array.from({ length: 20 }, () => 30000000000 + Math.random() * 10000000000),
    },
  ],
};

console.log('=== QTENDIES EXPERIMENT v1.1.0 ===\n');

// Run analysis
const result = agent.analyze(marketData);

console.log('MARKET REGIME:');
console.log('  State:', result.regime.state.toUpperCase());
console.log('  Confidence:', (result.regime.confidence * 100).toFixed(1) + '%');
console.log('  Superposition Score:', (result.regime.superpositionScore * 100).toFixed(1) + '%');

console.log('\nTRADE SIGNALS:');
for (const signal of result.signals) {
  console.log(' ', signal.action.toUpperCase(), signal.symbol, '@ $' + signal.targetPrice.toFixed(2), '| Conf:', (signal.confidence * 100).toFixed(0) + '%');
  console.log('    Reasoning:', signal.reasoning);
}

console.log('\nPORTFOLIO STATE:');
console.log('  Total Value: $' + result.portfolio.metrics.totalValue.toFixed(2));
console.log('  Sharpe Ratio:', result.portfolio.metrics.sharpeRatio.toFixed(3));
console.log('  Volatility:', (result.portfolio.metrics.volatility * 100).toFixed(2) + '%');
console.log('  Max Drawdown:', (result.portfolio.metrics.maxDrawdown * 100).toFixed(2) + '%');
console.log('  Positions:', result.portfolio.positions.length);

console.log('\nAGENT STATUS JSON:');
console.log(agent.getStatus());

console.log('\nHEALTH CHECK:');
const health = agent.healthCheck();
console.log('  Status:', health.status.toUpperCase());
console.log('  Cycles:', health.lastCycle);
console.log('  Last Regime:', health.lastRegime);
console.log('  Portfolio Value: $' + health.portfolioValue.toFixed(2));
if (health.errors.length > 0) {
  console.log('  Errors:', health.errors.join(', '));
}

console.log('\n=== EXPERIMENT COMPLETE ===');