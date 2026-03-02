import { AgentType, AGENT_CONFIGS, AgentResult, AgentError } from './types';
import { StateManager } from './state';
import { Router } from './router';
import {
  ChatAgent,
  WebSearchAgent,
  ResearchAgent,
  MermaidAgent,
  PDFAgent,
  MarkdownAgent,
  UIUXAgent,
  BaseAgent,
} from './agents';

export class Supervisor {
  private agents: Map<AgentType, BaseAgent>;
  private router: Router;

  constructor() {
    this.agents = new Map();
    this.router = new Router();

    // Initialize all agents
    this.agents.set('chat', new ChatAgent());
    this.agents.set('web_search', new WebSearchAgent());
    this.agents.set('research', new ResearchAgent());
    this.agents.set('mermaid', new MermaidAgent());
    this.agents.set('pdf', new PDFAgent());
    this.agents.set('markdown', new MarkdownAgent());
    this.agents.set('ui_ux', new UIUXAgent());
  }

  async processQuery(
    query: string,
    context?: Record<string, any>,
    preferredAgents?: AgentType[]
  ): Promise<{ results: AgentResult[]; errors: AgentError[]; durationMs: number }> {
    const stateManager = new StateManager(query, context);
    const startTime = Date.now();

    // Route query to appropriate agents
    const routeDecision = await this.router.routeQuery(query, preferredAgents);
    console.log(`[Supervisor] Routing decision: ${routeDecision.reasoning}`);
    console.log(`[Supervisor] Selected agents: ${routeDecision.agents.join(', ')}`);

    // Execute agents in parallel with timeout handling
    const agentPromises = routeDecision.agents.map(agentType =>
      this.executeAgentWithTimeout(agentType, query, stateManager, context)
    );

    // Wait for all agents to complete (or timeout)
    await Promise.all(agentPromises);

    // Mark completion
    stateManager.complete();

    const durationMs = Date.now() - startTime;
    console.log(`[Supervisor] Query processed in ${durationMs}ms`);

    return {
      results: stateManager.getResults(),
      errors: stateManager.getErrors(),
      durationMs,
    };
  }

  private async executeAgentWithTimeout(
    agentType: AgentType,
    query: string,
    stateManager: StateManager,
    context?: Record<string, any>
  ): Promise<void> {
    const agent = this.agents.get(agentType);
    if (!agent) {
      const error: AgentError = {
        agentType,
        message: `Agent ${agentType} not found`,
        code: 'AGENT_NOT_FOUND',
        timestamp: Date.now(),
      };
      stateManager.setAgentError(agentType, error);
      return;
    }

    const config = AGENT_CONFIGS[agentType];
    const timeoutMs = config.timeoutMs;

    // Set initial status
    stateManager.setAgentStatus(agentType, 'pending');

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Agent ${agentType} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Race between agent execution and timeout
      await Promise.race([
        agent.execute(query, stateManager, context),
        timeoutPromise,
      ]);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message.includes('timed out');
      
      const agentError: AgentError = {
        agentType,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: isTimeout ? 'TIMEOUT' : 'EXECUTION_ERROR',
        timestamp: Date.now(),
      };
      
      stateManager.setAgentError(agentType, agentError);
      
      if (isTimeout) {
        stateManager.setAgentStatus(agentType, 'timeout');
      }
      
      console.error(`[Supervisor] Agent ${agentType} failed:`, error);
    }
  }

  getStateManager(query: string, context?: Record<string, any>): StateManager {
    return new StateManager(query, context);
  }

  async processQueryWithStreaming(
    query: string,
    stateManager: StateManager,
    preferredAgents?: AgentType[]
  ): Promise<void> {
    // Route query to appropriate agents
    const routeDecision = await this.router.routeQuery(query, preferredAgents);
    console.log(`[Supervisor] Routing decision: ${routeDecision.reasoning}`);
    console.log(`[Supervisor] Selected agents: ${routeDecision.agents.join(', ')}`);

    // Execute agents in parallel
    const agentPromises = routeDecision.agents.map(agentType =>
      this.executeAgentWithTimeout(agentType, query, stateManager)
    );

    // Wait for all agents to complete
    await Promise.all(agentPromises);

    // Mark completion
    stateManager.complete();
  }
}
