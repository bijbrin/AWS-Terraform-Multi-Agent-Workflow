import { ChatOpenAI } from '@langchain/openai';
import { AgentType, RouteDecision, AGENT_CONFIGS } from './types';

export class Router {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async routeQuery(query: string, preferredAgents?: AgentType[]): Promise<RouteDecision> {
    // If preferred agents are specified, use them
    if (preferredAgents && preferredAgents.length > 0) {
      return {
        agents: preferredAgents,
        reasoning: 'Using user-specified agents',
      };
    }

    const systemPrompt = `You are a query router for a multi-agent system. Your job is to analyze the user's query and determine which agents should handle it.

Available agents:
${Object.entries(AGENT_CONFIGS)
  .map(([type, config]) => `- ${type}: ${config.description}`)
  .join('\n')}

Analyze the query and return a JSON object with:
- agents: array of agent types that should handle this query (can be multiple for parallel processing)
- reasoning: brief explanation of why these agents were selected

Rules:
- Select ALL agents that could contribute meaningfully
- For general conversation, use 'chat'
- For current events or facts, use 'web_search'
- For in-depth analysis, use 'research'
- For diagrams or visualizations, use 'mermaid'
- For document generation, use 'pdf' or 'markdown'
- For UI/React code, use 'ui_ux'

Respond ONLY with valid JSON.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Query: "${query}"` },
    ];

    try {
      const response = await this.model.invoke(messages);
      const content = response.content as string;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]) as RouteDecision;
        // Validate agents
        decision.agents = decision.agents.filter(agent => agent in AGENT_CONFIGS);
        return decision;
      }
      
      // Fallback to chat agent
      return {
        agents: ['chat'],
        reasoning: 'Failed to parse routing decision, defaulting to chat',
      };
    } catch (error) {
      console.error('Routing error:', error);
      return {
        agents: ['chat'],
        reasoning: 'Error during routing, defaulting to chat',
      };
    }
  }
}
