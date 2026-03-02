# Multi-Agent System

A scalable multi-agent system built with LangGraph, OpenAI, and Express.

## Architecture

```
┌─────────────────┐
│  Supervisor     │
│    Agent        │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┬────────┬────────┬────────┐
    │         │        │        │        │        │        │
┌───▼───┐ ┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│ Chat  │ │ Web   │ │Research│ │Mermaid│ │ PDF  │ │Markdown│ │UI/UX │
│ Agent │ │Search │ │ Agent │ │ Agent │ │ Agent│ │ Agent │ │ Agent│
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

## Features

- **Parallel Execution**: All sub-agents run concurrently using Promise.all
- **Streaming Responses**: Server-Sent Events (SSE) for real-time updates
- **State Management**: Centralized state with LangGraph
- **Error Handling**: Comprehensive error handling and timeouts
- **Tool Definitions**: Each agent has specialized tools

## Project Structure

```
multi-agent-system/
├── src/
│   ├── agents/           # Agent implementations
│   │   ├── base.ts       # Base agent class
│   │   ├── chat.ts       # Chat agent
│   │   ├── webSearch.ts  # Web search agent
│   │   ├── research.ts   # Research agent
│   │   ├── mermaid.ts    # Mermaid diagram agent
│   │   ├── pdf.ts        # PDF generation agent
│   │   ├── markdown.ts   # Markdown generation agent
│   │   ├── uiux.ts       # UI/UX React agent
│   │   └── index.ts      # Agent exports
│   ├── langgraph/        # LangGraph implementation
│   │   ├── supervisor.ts # LangGraph supervisor
│   │   └── index.ts
│   ├── types.ts          # TypeScript types
│   ├── state.ts          # State management
│   ├── router.ts         # Query router
│   ├── supervisor.ts     # Main supervisor
│   ├── server.ts         # Express server
│   ├── cli.ts            # CLI interface
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Agents

1. **Chat Agent** - Direct LLM conversation
2. **Web Search Agent** - Search and summarize web results
3. **Research Agent** - Deep research with multiple sources
4. **Mermaid Agent** - Generate diagrams from descriptions
5. **PDF Agent** - Generate PDF documents
6. **Markdown Agent** - Generate formatted markdown
7. **UI/UX Agent** - Generate React app designs with code

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run development server
npm run dev

# Or build and run
npm run build
npm start
```

## API

### POST /api/query
Submit a query to the multi-agent system.

**Request:**
```json
{
  "query": "Explain quantum computing",
  "context": { "userId": "123" },
  "preferredAgents": ["chat", "mermaid"]
}
```

**Response:**
```json
{
  "query": "Explain quantum computing",
  "results": [
    {
      "agentType": "chat",
      "content": "Quantum computing is...",
      "timestamp": 1234567890,
      "durationMs": 2500
    }
  ],
  "errors": [],
  "durationMs": 3000,
  "completedAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/stream
Stream results via SSE.

```bash
curl "http://localhost:3000/api/stream?q=Explain+quantum+computing"
```

**Events:**
- `status` - Agent status updates (pending, running, completed, error)
- `result` - Agent completion with content
- `error` - Agent error information
- `complete` - All agents finished

### GET /api/agents
List available agents.

**Response:**
```json
{
  "agents": [
    { "type": "chat", "name": "Chat Agent", "description": "..." },
    ...
  ]
}
```

### GET /health
Health check endpoint.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `PORT` | No | 3000 | Server port |
| `*_AGENT_TIMEOUT` | No | varies | Agent-specific timeouts |

## CLI Usage

```bash
# Run with default query
npm run dev

# Run with custom query
npx tsx src/cli.ts "Your query here"
```

## Implementation Details

### Parallel Execution

Agents execute in parallel using `Promise.all()` with individual timeouts:

```typescript
const agentPromises = selectedAgents.map(agentType =>
  this.executeAgentWithTimeout(agentType, query, stateManager)
);
await Promise.all(agentPromises);
```

### State Management

The `StateManager` class tracks:
- Query and context
- Agent statuses
- Results and errors
- Event streaming

### Streaming

Server-Sent Events provide real-time updates:
- Status changes
- Results as they're ready
- Error notifications
- Completion signal

### Error Handling

Each agent has:
- Individual timeout protection
- Error catching and reporting
- Status updates on failure
- Graceful degradation

## Extending

### Adding a New Agent

1. Create `src/agents/newAgent.ts`:
```typescript
export class NewAgent extends BaseAgent {
  constructor() {
    super('new_agent');
  }

  getSystemPrompt(): string {
    return 'Your system prompt...';
  }

  getTools(): ToolDefinition[] {
    return [];
  }
}
```

2. Register in `src/agents/index.ts`
3. Add to `src/supervisor.ts` agent map
4. Add config to `src/types.ts` `AGENT_CONFIGS`

## License

MIT
