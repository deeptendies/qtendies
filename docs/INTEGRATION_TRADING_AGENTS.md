# TradingAgents Integration for QTendies
# Enables qtendies to leverage TradingAgents' multi-agent framework

## Integration Architecture

```
qtendies (TypeScript)
    └── src/integrations/trading_agents_bridge.ts
            └── interfaces with TradingAgents via Python subprocess
                    └── TradingAgents.main.py
                            └── TradingAgentsGraph
                                    ├── Analyst Team (Fundamentals, Sentiment, News, Technical)
                                    ├── Researcher Team (Bull/Bear researchers)
                                    ├── Trader Agent
                                    └── Risk Management + Portfolio Manager
```

## How It Works

1. **QTendies** calls `TradingAgentsBridge.analyze()` with a ticker and date
2. **Bridge** spawns Python subprocess running TradingAgents
3. **TradingAgents** runs multi-agent analysis (analysts → researchers → trader → risk)
4. **Bridge** parses the decision output and converts to qtendies signals
5. **QTendies** uses these signals as alternative data / confirmation layer

## Key Functions

### analyze(ticker: string, date: string): Promise<TradingAgentsDecision>
Runs full TradingAgents multi-agent analysis and returns structured decision

### getAnalystsReport(ticker: string, date: string): Promise<AnalystsReport>
Gets detailed analyst team report (fundamentals, sentiment, news, technical)

### getDebateHistory(ticker: string, date: string): Promise<DebateRounds>
Gets the bull/bear debate rounds for transparency

## Output Mapping

TradingAgents outputs → QTendies signals:
- `BUY` → Positive quantum modifier boost
- `SELL` → Negative quantum modifier
- `HOLD` → Neutral, confidence based on conviction score
- `decision.confidence` → Maps to quantum state confidence
- `decision.position_size` → Used in portfolio weight calculation

## Usage Example

```typescript
import { TradingAgentsBridge } from "./integrations/trading_agents_bridge";

const bridge = new TradingAgentsBridge();
const decision = await bridge.analyze("NVDA", "2024-05-10");

// Use decision to boost qtendies signals
if (decision.action === "BUY") {
  quantumModifier *= 1.2; // Boost conviction
}
```

## Requirements

- Python 3.10+
- TradingAgents installed: `pip install tradingagents`
- API keys in `.env` (OPENAI_API_KEY, etc.)

## Supported Models

TradingAgents supports: GPT-5.x, Gemini 3.x, Claude 4.x, DeepSeek, Qwen, Azure OpenAI