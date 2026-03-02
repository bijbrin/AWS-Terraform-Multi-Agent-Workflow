import { AgentState, AgentType, AgentResult, AgentError, AgentStatus, StreamEvent } from './types';

export class StateManager {
  private state: AgentState;
  private eventListeners: ((event: StreamEvent) => void)[] = [];

  constructor(query: string, context?: Record<string, any>) {
    this.state = {
      query,
      context,
      results: new Map(),
      errors: new Map(),
      status: new Map(),
      startTime: Date.now(),
    };
  }

  getState(): AgentState {
    return this.state;
  }

  setAgentStatus(agentType: AgentType, status: AgentStatus): void {
    this.state.status.set(agentType, status);
    this.emit({
      type: 'status',
      agentType,
      data: { status },
      timestamp: Date.now(),
    });
  }

  setAgentResult(agentType: AgentType, result: AgentResult): void {
    this.state.results.set(agentType, result);
    this.state.status.set(agentType, 'completed');
    this.emit({
      type: 'result',
      agentType,
      data: result,
      timestamp: Date.now(),
    });
  }

  setAgentError(agentType: AgentType, error: AgentError): void {
    this.state.errors.set(agentType, error);
    this.state.status.set(agentType, 'error');
    this.emit({
      type: 'error',
      agentType,
      data: error,
      timestamp: Date.now(),
    });
  }

  complete(): void {
    this.state.endTime = Date.now();
    this.emit({
      type: 'complete',
      data: {
        durationMs: this.state.endTime - this.state.startTime,
        results: Array.from(this.state.results.values()),
        errors: Array.from(this.state.errors.values()),
      },
      timestamp: Date.now(),
    });
  }

  onEvent(listener: (event: StreamEvent) => void): void {
    this.eventListeners.push(listener);
  }

  private emit(event: StreamEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  getResults(): AgentResult[] {
    return Array.from(this.state.results.values());
  }

  getErrors(): AgentError[] {
    return Array.from(this.state.errors.values());
  }

  getDurationMs(): number {
    return (this.state.endTime || Date.now()) - this.state.startTime;
  }
}
