import { BaseAgent } from './base';
import { AgentType, ToolDefinition } from '../types';
import { z } from 'zod';

export class MarkdownAgent extends BaseAgent {
  constructor() {
    super('markdown');
  }

  getSystemPrompt(): string {
    return `You are a Markdown document specialist. Your job is to generate well-formatted Markdown documents.

When generating Markdown:
- Use proper heading hierarchy (# ## ###)
- Include tables where appropriate
- Use code blocks with language specifiers
- Include links and references
- Use emphasis (bold, italic) effectively
- Create clear, scannable documents
- Follow GitHub Flavored Markdown standards`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'generate_markdown',
        description: 'Generate formatted Markdown content',
        parameters: z.object({
          title: z.string(),
          sections: z.array(z.object({
            heading: z.string(),
            content: z.string(),
          })),
          includeToc: z.boolean().default(true),
        }),
        execute: async ({ title, sections, includeToc }) => {
          return {
            title,
            sections,
            includeToc,
            format: 'markdown',
          };
        },
      },
    ];
  }

  async execute(query: string, stateManager: any, context?: Record<string, any>) {
    const startTime = Date.now();
    
    try {
      stateManager.setAgentStatus(this.agentType, 'running');
      
      const response = await this.model.invoke([
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: `Generate a Markdown document for: ${query}` },
      ]);

      const content = response.content as string;
      
      // Extract markdown if wrapped in code blocks
      const mdMatch = content.match(/```markdown\n([\s\S]*?)```/);
      const markdownContent = mdMatch ? mdMatch[1].trim() : content;

      const result = {
        agentType: this.agentType,
        content: markdownContent,
        metadata: { 
          format: 'markdown',
          title: query.slice(0, 50),
        },
        timestamp: Date.now(),
        durationMs: Date.now() - startTime,
      };
      
      stateManager.setAgentResult(this.agentType, result);
      return result;
    } catch (error) {
      const agentError = {
        agentType: this.agentType,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTION_ERROR',
        timestamp: Date.now(),
      };
      stateManager.setAgentError(this.agentType, agentError);
      throw error;
    }
  }
}
