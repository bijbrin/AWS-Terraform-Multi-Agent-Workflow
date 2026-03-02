import { BaseAgent } from './base';
import { AgentType, ToolDefinition } from '../types';
import { z } from 'zod';

export class MermaidAgent extends BaseAgent {
  constructor() {
    super('mermaid');
  }

  getSystemPrompt(): string {
    return `You are a Mermaid diagram specialist. Your job is to generate valid Mermaid diagram code from descriptions.

Supported diagram types:
- Flowchart (flowchart TD, flowchart LR)
- Sequence diagram
- Class diagram
- State diagram
- Entity Relationship diagram
- Gantt chart
- Pie chart
- Git graph
- User journey

Rules:
- Generate ONLY valid Mermaid syntax
- Do not include markdown code blocks unless necessary
- Ensure proper indentation and syntax
- Choose the most appropriate diagram type for the content
- Add comments to explain complex sections`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'generate_diagram',
        description: 'Generate a Mermaid diagram from description',
        parameters: z.object({
          description: z.string(),
          diagramType: z.enum([
            'flowchart',
            'sequence',
            'class',
            'state',
            'er',
            'gantt',
            'pie',
            'git',
            'journey',
          ]).default('flowchart'),
        }),
        execute: async ({ description, diagramType }) => {
          // The actual diagram generation happens in the LLM call
          // This tool validates and structures the request
          return {
            description,
            diagramType,
            generated: true,
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
        { role: 'user', content: `Generate a Mermaid diagram for: ${query}` },
      ]);

      const content = response.content as string;
      
      // Extract mermaid code if wrapped in markdown
      const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
      const mermaidCode = mermaidMatch ? mermaidMatch[1].trim() : content;

      const result = {
        agentType: this.agentType,
        content: mermaidCode,
        metadata: { 
          diagramType: this.inferDiagramType(mermaidCode),
          rawResponse: content,
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

  private inferDiagramType(code: string): string {
    if (code.includes('flowchart')) return 'flowchart';
    if (code.includes('sequenceDiagram')) return 'sequence';
    if (code.includes('classDiagram')) return 'class';
    if (code.includes('stateDiagram')) return 'state';
    if (code.includes('erDiagram')) return 'er';
    if (code.includes('gantt')) return 'gantt';
    if (code.includes('pie')) return 'pie';
    if (code.includes('gitGraph')) return 'git';
    if (code.includes('journey')) return 'journey';
    return 'unknown';
  }
}
