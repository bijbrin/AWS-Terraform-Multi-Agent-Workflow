import { BaseAgent } from './base';
import { AgentType, ToolDefinition } from '../types';
import { z } from 'zod';

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research');
  }

  getSystemPrompt(): string {
    return `You are a research specialist. Your job is to conduct deep research on topics and provide comprehensive, well-structured analysis.

When researching:
- Explore multiple angles and perspectives
- Synthesize information from various sources
- Provide structured analysis with clear sections
- Include key findings, insights, and implications
- Note limitations or gaps in available information
- Be thorough but organized`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'deep_research',
        description: 'Conduct deep research on a topic',
        parameters: z.object({
          query: z.string(),
          depth: z.enum(['basic', 'moderate', 'deep']).default('moderate'),
        }),
        execute: async ({ query, depth }) => {
          // Placeholder for actual research implementation
          // In production, this could use multiple search queries, academic APIs, etc.
          return {
            topic: query,
            depth,
            findings: [
              'Key finding 1: Placeholder for actual research',
              'Key finding 2: Integrate with multiple data sources',
              'Key finding 3: Consider using academic databases, news APIs, etc.',
            ],
            sources: ['source1', 'source2', 'source3'],
          };
        },
      },
    ];
  }
}
