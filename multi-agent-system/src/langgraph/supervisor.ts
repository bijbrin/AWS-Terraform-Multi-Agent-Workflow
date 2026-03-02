import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END } from '@langchain/langgraph';
import { AgentState, AgentType, AgentResult, AgentError } from './types';
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

// LangGraph state channel
interface GraphState {
  query: string;
  context?: Record<string, any>;
  selectedAgents: AgentType[];
  results: AgentResult[];
  errors: AgentError[];
  currentAgent?: AgentType;
}

export class LangGraphSupervisor {
  private agents: Map<AgentType, BaseAgent>;
  private router: Router;
  private graph: any;

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

    // Build the graph
    this.graph = this.buildGraph();
  }

  private buildGraph() {
    // Define the state graph
    const workflow = new StateGraph<GraphState>({
      channels: {
        query: { value: (x: string, y: string) => y || x },
        context: { value: (x: any, y: any) => y || x },
        selectedAgents: { value: (x: AgentType[], y: AgentType[]) => y || x },
        results: { value: (x: AgentResult[], y: AgentResult[]) => [...(x || []), ...(y || [])] },
        errors: { value: (x: AgentError[], y: AgentError[]) => [...(x || []), ...(y || [])] },
        currentAgent: { value: (x: AgentType, y: AgentType) => y || x },
      },
    });

    // Router node - decides which agents to use
    workflow.addNode('router', async (state: GraphState) => {
      const decision = await this.router.routeQuery(state.query);
      return {
        ...state,
        selectedAgents: decision.agents,
      };
    });

    // Add agent nodes
    for (const [agentType, agent] of this.agents) {
      workflow.addNode(agentType, async (state: GraphState) => {
        const startTime = Date.now();
        try {
          // Create a temporary state manager for this agent
          const tempStateManager = {
            setAgentStatus: () => {},
            setAgentResult: () => {},
            setAgentError: () => {},
            complete: () => {},
          };

          const result = await agent.execute(state.query, tempStateManager as any, state.context);
          return {
            ...state,
            results: [...state.results, result],
          };
        } catch (error) {
          const agentError: AgentError = {
            agentType: agentType as AgentType,
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'EXECUTION_ERROR',
            timestamp: Date.now(),
          };
          return {
            ...state,
            errors: [...state.errors, agentError],
          };
        }
      });
    }

    // Add edges
    workflow.setEntryPoint('router');

    // Conditional edges from router to agents
    workflow.addConditionalEdges(
      'router',
      (state: GraphState) => state.selectedAgents,
      Object.fromEntries(
        Array.from(this.agents.keys()).map(type => [type, type])
      )
    );

    // All agents go to END
    for (const agentType of this.agents.keys()) {
      workflow.addEdge(agentType, END);
    }

    return workflow.compile();
  }

  async processQuery(
    query: string,
    context?: Record<string, any>,
    preferredAgents?: AgentType[]
  ): Promise<{ results: AgentResult[]; errors: AgentError[]; durationMs: number }> {
    const startTime = Date.now();

    // If preferred agents specified, skip routing
    const initialState: GraphState = {
      query,
      context,
      selectedAgents: preferredAgents || [],
      results: [],
      errors: [],
    };

    try {
      const finalState = await this.graph.invoke(initialState);
      
      return {
        results: finalState.results,
        errors: finalState.errors,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[LangGraphSupervisor] Error:', error);
      return {
        results: [],
        errors: [{
          agentType: 'supervisor' as AgentType,
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'GRAPH_ERROR',
          timestamp: Date.now(),
        }],
        durationMs: Date.now() - startTime,
      };
    }
  }
}
