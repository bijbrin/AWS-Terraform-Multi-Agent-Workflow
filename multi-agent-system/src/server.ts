import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { Supervisor } from './supervisor';
import { StateManager } from './state';
import { QueryRequest, StreamEvent } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize supervisor
const supervisor = new Supervisor();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root redirect to dashboard
app.get('/', (req: Request, res: Response) => {
  res.redirect('/dashboard');
});

// Query endpoint - synchronous response
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { query, context, preferredAgents } = req.body as QueryRequest;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`[API] Received query: ${query.slice(0, 100)}...`);

    const result = await supervisor.processQuery(query, context, preferredAgents);

    res.json({
      query,
      results: result.results,
      errors: result.errors,
      durationMs: result.durationMs,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error processing query:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Streaming endpoint - Server-Sent Events
app.get('/api/stream', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const preferredAgents = req.query.agents ? (req.query.agents as string).split(',') as any : undefined;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stateManager = supervisor.getStateManager(query);

    // Listen for events
    stateManager.onEvent((event: StreamEvent) => {
      const data = JSON.stringify(event);
      res.write(`data: ${data}\n\n`);
    });

    // Process query with streaming
    await supervisor.processQueryWithStreaming(query, stateManager, preferredAgents);

    // End the stream
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[API] Error in streaming:', error);
    const errorData = JSON.stringify({
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: Date.now(),
    });
    res.write(`data: ${errorData}\n\n`);
    res.end();
  }
});

// Get available agents
app.get('/api/agents', (req: Request, res: Response) => {
  const agents = [
    { type: 'chat', name: 'Chat Agent', description: 'Direct LLM conversation' },
    { type: 'web_search', name: 'Web Search Agent', description: 'Search and summarize web results' },
    { type: 'research', name: 'Research Agent', description: 'Deep research with multiple sources' },
    { type: 'mermaid', name: 'Mermaid Agent', description: 'Generate diagrams from descriptions' },
    { type: 'pdf', name: 'PDF Agent', description: 'Generate PDF documents' },
    { type: 'markdown', name: 'Markdown Agent', description: 'Generate formatted markdown' },
  ];

  res.json({ agents });
});

// Dashboard route
app.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Multi-Agent System server running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - POST /api/query    - Submit a query`);
  console.log(`   - GET  /api/stream   - Stream results via SSE`);
  console.log(`   - GET  /api/agents   - List available agents`);
  console.log(`   - GET  /dashboard    - View system dashboard`);
  console.log(`   - GET  /health       - Health check`);
});
