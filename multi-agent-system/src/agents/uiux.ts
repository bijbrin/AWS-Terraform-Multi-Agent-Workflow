import { BaseAgent } from './base';
import { AgentType } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * UIUX Agent - Creates a standalone visualization dashboard
 * This is NOT a sub-agent for task processing.
 * It generates an HTML dashboard to visualize the multi-agent system in action.
 */
export class UIUXAgent extends BaseAgent {
  constructor() {
    super('ui_ux');
  }

  getSystemPrompt(): string {
    return `You are a visualization specialist. You create interactive HTML dashboards.

Your ONLY job is to generate a standalone HTML file that visualizes the multi-agent system.
This is a DASHBOARD, not a task-processing agent.

The dashboard should show:
- Real-time agent activity
- Query flow visualization
- Performance metrics
- System status`;
  }

  /**
   * Generate the visualization dashboard
   * This creates a standalone HTML file for monitoring the multi-agent system
   */
  async generateDashboard(outputDir: string): Promise<string> {
    const htmlContent = this.generateDashboardHTML();
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'dashboard.html');
    fs.writeFileSync(outputPath, htmlContent);
    
    return outputPath;
  }

  /**
   * Execute is used only to regenerate the dashboard if needed
   */
  async execute(query: string, stateManager: any, context?: Record<string, any>) {
    const startTime = Date.now();
    
    try {
      stateManager.setAgentStatus(this.agentType, 'running');
      
      const outputDir = path.join(process.cwd(), 'public');
      const outputPath = await this.generateDashboard(outputDir);

      const result = {
        agentType: this.agentType,
        content: `Multi-Agent System Dashboard generated at: /dashboard.html

Open http://localhost:3000/dashboard.html to view the real-time visualization.

The dashboard shows:
- Live agent network with animated connections
- Query processing flow in real-time
- Agent status (idle, processing, completed, error)
- Performance metrics (active agents, completed tasks, response time)
- System logs with color-coded entries
- Demo mode to simulate queries`,
        metadata: { 
          outputPath: '/dashboard.html',
          type: 'visualization_dashboard',
          note: 'This is a monitoring dashboard, not a task-processing agent',
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

  private generateDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Agent System Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%);
            min-height: 100vh;
            color: #e0e0ff;
        }

        .header {
            padding: 20px 40px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            background: linear-gradient(90deg, #00f2ff, #ff00a0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            background: rgba(0,255,100,0.1);
            border-radius: 20px;
            border: 1px solid rgba(0,255,100,0.3);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #00ff64;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .main {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 20px;
            padding: 20px 40px;
            max-width: 1600px;
            margin: 0 auto;
        }

        .network-panel {
            background: rgba(0,0,0,0.3);
            border-radius: 16px;
            padding: 20px;
            min-height: 500px;
            position: relative;
        }

        .panel-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8888aa;
            margin-bottom: 20px;
        }

        .network {
            position: relative;
            width: 100%;
            height: 450px;
        }

        .node {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            cursor: pointer;
        }

        .node:hover {
            transform: scale(1.1);
        }

        .node.supervisor {
            width: 130px;
            height: 130px;
            background: linear-gradient(135deg, #ff007a, #7000ff);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            box-shadow: 0 0 50px rgba(255, 0, 122, 0.4);
        }

        .node.agent {
            background: linear-gradient(135deg, #00c6ff, #0072ff);
            box-shadow: 0 4px 20px rgba(0, 114, 255, 0.3);
        }

        .node.agent:nth-child(2) { top: 5%; left: 50%; transform: translateX(-50%); }
        .node.agent:nth-child(3) { top: 20%; right: 15%; }
        .node.agent:nth-child(4) { top: 50%; right: 5%; transform: translateY(-50%); }
        .node.agent:nth-child(5) { bottom: 20%; right: 15%; }
        .node.agent:nth-child(6) { bottom: 5%; left: 50%; transform: translateX(-50%); }
        .node.agent:nth-child(7) { bottom: 20%; left: 15%; }
        .node.agent:nth-child(8) { top: 50%; left: 5%; transform: translateY(-50%); }

        .node.processing {
            animation: processing 1s linear infinite;
            border-color: #fff;
        }

        @keyframes processing {
            0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
            100% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
        }

        .node.completed {
            background: linear-gradient(135deg, #00ff88, #00cc6a) !important;
        }

        .node.error {
            background: linear-gradient(135deg, #ff4444, #cc0000) !important;
        }

        .node-icon {
            font-size: 28px;
            margin-bottom: 4px;
        }

        .connection-line {
            position: absolute;
            background: linear-gradient(90deg, transparent, rgba(0,242,255,0.3), transparent);
            height: 2px;
            transform-origin: left center;
        }

        .data-flow {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00f2ff;
            box-shadow: 0 0 10px #00f2ff;
            display: none;
        }

        .data-flow.active {
            display: block;
            animation: flow 2s linear infinite;
        }

        @keyframes flow {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .metrics-card {
            background: rgba(0,0,0,0.3);
            border-radius: 16px;
            padding: 20px;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .metric:last-child { border-bottom: none; }

        .metric-label {
            font-size: 13px;
            color: #8888aa;
        }

        .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #00f2ff;
        }

        .logs-panel {
            background: rgba(0,0,0,0.3);
            border-radius: 16px;
            padding: 20px;
            flex: 1;
            min-height: 300px;
        }

        .log-entry {
            padding: 10px 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border-left: 3px solid;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .log-entry.info { background: rgba(0,242,255,0.08); border-color: #00f2ff; }
        .log-entry.success { background: rgba(0,255,100,0.08); border-color: #00ff64; }
        .log-entry.processing { background: rgba(255,193,7,0.08); border-color: #ffc107; }
        .log-entry.error { background: rgba(255,68,68,0.08); border-color: #ff4444; }

        .controls {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(45deg, #ff007a, #7000ff);
            color: white;
        }

        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #e0e0ff;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .query-display {
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
            font-family: monospace;
            font-size: 13px;
            color: #00f2ff;
            min-height: 60px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Multi-Agent System Dashboard</h1>
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span>System Online</span>
        </div>
    </div>

    <div class="main">
        <div class="network-panel">
            <div class="panel-title">Agent Network</div>
            <div class="network" id="network">
                <div class="node supervisor" id="supervisor">
                    <div class="node-icon">🎯</div>
                    <div>Supervisor</div>
                </div>
                <div class="node agent" id="agent-chat" data-agent="chat">
                    <div class="node-icon">💬</div>
                    <div>Chat</div>
                </div>
                <div class="node agent" id="agent-web" data-agent="web">
                    <div class="node-icon">🔍</div>
                    <div>Web Search</div>
                </div>
                <div class="node agent" id="agent-research" data-agent="research">
                    <div class="node-icon">📚</div>
                    <div>Research</div>
                </div>
                <div class="node agent" id="agent-mermaid" data-agent="mermaid">
                    <div class="node-icon">📊</div>
                    <div>Mermaid</div>
                </div>
                <div class="node agent" id="agent-pdf" data-agent="pdf">
                    <div class="node-icon">📄</div>
                    <div>PDF</div>
                </div>
                <div class="node agent" id="agent-markdown" data-agent="markdown">
                    <div class="node-icon">📝</div>
                    <div>Markdown</div>
                </div>
            </div>
            
            <div class="query-display" id="currentQuery">
                Waiting for query...
            </div>
        </div>

        <div class="sidebar">
            <div class="metrics-card">
                <div class="panel-title">Metrics</div>
                <div class="metric">
                    <span class="metric-label">Active Agents</span>
                    <span class="metric-value" id="activeCount">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Completed</span>
                    <span class="metric-value" id="completedCount">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Response</span>
                    <span class="metric-value" id="avgTime">0ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Queries</span>
                    <span class="metric-value" id="totalQueries">0</span>
                </div>
                
                <div class="controls">
                    <button class="btn btn-primary" onclick="simulateQuery()">▶ Simulate</button>
                    <button class="btn btn-secondary" onclick="clearLogs()">Clear</button>
                </div>
            </div>

            <div class="logs-panel">
                <div class="panel-title">System Logs</div>
                <div id="logs">
                    <div class="log-entry info">Dashboard initialized</div>
                    <div class="log-entry info">7 agents ready</div>
                    <div class="log-entry info">Supervisor online</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const agents = ['chat', 'web', 'research', 'mermaid', 'pdf', 'markdown'];
        let metrics = { active: 0, completed: 0, total: 0, times: [] };
        let isSimulating = false;

        function log(message, type = 'info') {
            const logs = document.getElementById('logs');
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            logs.insertBefore(entry, logs.firstChild);
            
            while (logs.children.length > 50) {
                logs.removeChild(logs.lastChild);
            }
        }

        function setAgentStatus(agentId, status) {
            const agent = document.getElementById(`agent-${agentId}`);
            if (!agent) return;
            
            agent.classList.remove('processing', 'completed', 'error');
            if (status) agent.classList.add(status);
        }

        function setSupervisorStatus(status) {
            const supervisor = document.getElementById('supervisor');
            supervisor.classList.remove('processing');
            if (status === 'processing') supervisor.classList.add('processing');
        }

        function updateMetrics() {
            document.getElementById('activeCount').textContent = metrics.active;
            document.getElementById('completedCount').textContent = metrics.completed;
            document.getElementById('totalQueries').textContent = metrics.total;
            
            const avg = metrics.times.length > 0 
                ? Math.round(metrics.times.reduce((a,b) => a+b, 0) / metrics.times.length)
                : 0;
            document.getElementById('avgTime').textContent = avg + 'ms';
        }

        async function simulateQuery() {
            if (isSimulating) return;
            isSimulating = true;
            metrics.total++;
            
            const queries = [
                "Research AI trends and create a summary",
                "Search for React best practices and generate code",
                "Create a mermaid diagram of microservices architecture",
                "Generate a PDF report on climate change",
                "Write markdown documentation for an API"
            ];
            
            const query = queries[Math.floor(Math.random() * queries.length)];
            document.getElementById('currentQuery').textContent = `> ${query}`;
            
            log(`New query: "${query}"`, 'processing');
            
            // Supervisor processing
            setSupervisorStatus('processing');
            log('Supervisor analyzing query...', 'processing');
            await delay(800);
            
            // Select relevant agents
            const selected = selectAgents(query);
            log(`Routing to: ${selected.join(', ')}`, 'info');
            setSupervisorStatus('');
            
            // Activate agents in parallel
            metrics.active = selected.length;
            updateMetrics();
            
            const startTime = Date.now();
            await Promise.all(selected.map(agent => runAgent(agent)));
            
            const duration = Date.now() - startTime;
            metrics.times.push(duration);
            metrics.active = 0;
            metrics.completed += selected.length;
            updateMetrics();
            
            log(`Query completed in ${duration}ms`, 'success');
            document.getElementById('currentQuery').textContent = 'Waiting for query...';
            isSimulating = false;
        }

        function selectAgents(query) {
            const q = query.toLowerCase();
            const selected = ['chat'];
            if (q.includes('search') || q.includes('find')) selected.push('web');
            if (q.includes('research') || q.includes('trend')) selected.push('research');
            if (q.includes('diagram') || q.includes('chart')) selected.push('mermaid');
            if (q.includes('pdf') || q.includes('report')) selected.push('pdf');
            if (q.includes('markdown') || q.includes('doc')) selected.push('markdown');
            return selected;
        }

        async function runAgent(agentId) {
            setAgentStatus(agentId, 'processing');
            log(`${agentId} agent processing...`, 'processing');
            
            await delay(1000 + Math.random() * 1500);
            
            setAgentStatus(agentId, 'completed');
            log(`${agentId} agent completed`, 'success');
            
            await delay(500);
            setAgentStatus(agentId, '');
        }

        function clearLogs() {
            document.getElementById('logs').innerHTML = '<div class="log-entry info">Logs cleared</div>';
        }

        function delay(ms) {
            return new Promise(r => setTimeout(r, ms));
        }

        // Auto-simulate on load
        setTimeout(simulateQuery, 1000);
    </script>
</body>
</html>`;
  }
}
