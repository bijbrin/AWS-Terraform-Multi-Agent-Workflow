import { ChatOpenAI } from '@langchain/openai';
import { AgentType, AgentResult, AgentError, ToolDefinition } from '../types';
import { StateManager } from '../state';

export abstract class BaseAgent {
  protected model: ChatOpenAI;
  protected agentType: AgentType;
  protected tools: ToolDefinition[] = [];

  constructor(agentType: AgentType) {
    this.agentType = agentType;
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  abstract getSystemPrompt(): string;
  abstract getTools(): ToolDefinition[];

  async execute(query: string, stateManager: StateManager, context?: Record<string, any>): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      stateManager.setAgentStatus(this.agentType, 'running');
      
      const systemPrompt = this.getSystemPrompt();
      const tools = this.getTools();
      
      // Build messages
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: query },
      ];

      // If tools are available, use tool calling
      if (tools.length > 0) {
        const toolResults = await this.executeWithTools(query, tools, context);
        const result: AgentResult = {
          agentType: this.agentType,
          content: toolResults,
          metadata: { toolsUsed: tools.map(t => t.name) },
          timestamp: Date.now(),
          durationMs: Date.now() - startTime,
        };
        stateManager.setAgentResult(this.agentType, result);
        return result;
      }

      // Simple LLM call
      const response = await this.model.invoke(messages);
      const result: AgentResult = {
        agentType: this.agentType,
        content: response.content as string,
        timestamp: Date.now(),
        durationMs: Date.now() - startTime,
      };
      
      stateManager.setAgentResult(this.agentType, result);
      return result;
    } catch (error) {
      const agentError: AgentError = {
        agentType: this.agentType,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTION_ERROR',
        timestamp: Date.now(),
      };
      stateManager.setAgentError(this.agentType, agentError);
      throw error;
    }
  }

  private async executeWithTools(
    query: string,
    tools: ToolDefinition[],
    context?: Record<string, any>
  ): Promise<string> {
    // Simple tool execution - can be enhanced with LangChain tool binding
    const results: string[] = [];
    
    for (const tool of tools) {
      try {
        const result = await tool.execute({ query, context });
        results.push(`Tool: ${tool.name}\nResult: ${JSON.stringify(result, null, 2)}`);
      } catch (error) {
        results.push(`Tool: ${tool.name}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Generate final response based on tool results
    const finalPrompt = `Based on the following tool results, provide a comprehensive response to the query: "${query}"

Tool Results:
${results.join('\n\n')}`;

    const response = await this.model.invoke([
      { role: 'system' as const, content: this.getSystemPrompt() },
      { role: 'user' as const, content: finalPrompt },
    ]);

    return response.content as string;
  }
}
