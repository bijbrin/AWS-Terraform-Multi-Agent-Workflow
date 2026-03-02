import { z } from 'zod';

// Agent types
export type AgentType = 
  | 'chat' 
  | 'web_search' 
  | 'research' 
  | 'mermaid' 
  | 'pdf' 
  | 'markdown' 
  | 'ui_ux';

export interface AgentConfig {
  name: string;
  description: string;
  timeoutMs: number;
  enabled: boolean;
}

// State management
export interface AgentState {
  query: string;
  context?: Record<string, any>;
  results: Map<AgentType, AgentResult>;
  errors: Map<AgentType, AgentError>;
  status: Map<AgentType, AgentStatus>;
  startTime: number;
  endTime?: number;
}

export interface AgentResult {
  agentType: AgentType;
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
  durationMs: number;
}

export interface AgentError {
  agentType: AgentType;
  message: string;
  code: string;
  timestamp: number;
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'error' | 'timeout';

// Streaming events
export interface StreamEvent {
  type: 'status' | 'result' | 'error' | 'complete';
  agentType?: AgentType;
  data: any;
  timestamp: number;
}

// Tool definitions
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema<any>;
  execute: (params: any) => Promise<any>;
}

// Agent configurations
export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  chat: {
    name: 'Chat Agent',
    description: 'Direct LLM conversation for general queries',
    timeoutMs: 30000,
    enabled: true,
  },
  web_search: {
    name: 'Web Search Agent',
    description: 'Search and summarize web results',
    timeoutMs: 45000,
    enabled: true,
  },
  research: {
    name: 'Research Agent',
    description: 'Deep research with multiple sources',
    timeoutMs: 60000,
    enabled: true,
  },
  mermaid: {
    name: 'Mermaid Agent',
    description: 'Generate diagrams from descriptions',
    timeoutMs: 30000,
    enabled: true,
  },
  pdf: {
    name: 'PDF Agent',
    description: 'Generate PDF documents',
    timeoutMs: 45000,
    enabled: true,
  },
  markdown: {
    name: 'Markdown Agent',
    description: 'Generate formatted markdown documents',
    timeoutMs: 30000,
    enabled: true,
  },
  ui_ux: {
    name: 'UI/UX Agent',
    description: 'Generate React app designs with code',
    timeoutMs: 60000,
    enabled: true,
  },
};

// Query routing
export interface RouteDecision {
  agents: AgentType[];
  reasoning: string;
}

// Request/Response types
export interface QueryRequest {
  query: string;
  context?: Record<string, any>;
  preferredAgents?: AgentType[];
}

export interface QueryResponse {
  query: string;
  results: AgentResult[];
  errors: AgentError[];
  durationMs: number;
  completedAt: string;
}
