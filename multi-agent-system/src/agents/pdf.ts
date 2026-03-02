import { BaseAgent } from './base';
import { AgentType, ToolDefinition } from '../types';
import { z } from 'zod';

export class PDFAgent extends BaseAgent {
  constructor() {
    super('pdf');
  }

  getSystemPrompt(): string {
    return `You are a PDF document generation specialist. Your job is to create well-structured HTML content that can be converted to PDF.

When generating PDF content:
- Use clean, semantic HTML
- Include proper styling for print
- Structure content with headers, sections, and lists
- Ensure content is self-contained
- Use inline styles for maximum compatibility

The HTML will be converted to PDF using Puppeteer or similar tools.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'generate_pdf_content',
        description: 'Generate HTML content for PDF conversion',
        parameters: z.object({
          title: z.string(),
          content: z.string(),
          style: z.enum(['professional', 'minimal', 'colorful']).default('professional'),
        }),
        execute: async ({ title, content, style }) => {
          return {
            title,
            content,
            style,
            format: 'html',
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
        { role: 'user', content: `Generate a PDF document for: ${query}` },
      ]);

      const content = response.content as string;
      
      // Extract HTML if wrapped in markdown
      const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
      const htmlContent = htmlMatch ? htmlMatch[1].trim() : this.wrapInHTML(content, query);

      const result = {
        agentType: this.agentType,
        content: htmlContent,
        metadata: { 
          format: 'html',
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

  private wrapInHTML(content: string, title: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }
}
