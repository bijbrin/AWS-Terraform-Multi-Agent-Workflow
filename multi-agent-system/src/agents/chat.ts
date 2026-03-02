import { BaseAgent } from './base';
import { AgentType, ToolDefinition } from '../types';
import { z } from 'zod';

export class ChatAgent extends BaseAgent {
  constructor() {
    super('chat');
  }

  getSystemPrompt(): string {
    return `You are a helpful AI assistant engaged in conversation with the user.

Your role is to:
- Provide clear, accurate, and helpful responses
- Ask clarifying questions when needed
- Be conversational but professional
- Admit when you don't know something

Respond naturally as if in a conversation.`;
  }

  getTools(): ToolDefinition[] {
    return []; // Chat agent uses direct LLM conversation
  }
}
