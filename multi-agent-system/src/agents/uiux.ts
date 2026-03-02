import { BaseAgent } from './base';
import { AgentType } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class UIUXAgent extends BaseAgent {
  constructor() {
    super('ui_ux');
  }

  getSystemPrompt(): string {
    return `You are a UI/UX visualization specialist. Your job is to create interactive HTML visualizations and simulations.

When creating visualizations:
- Create animated, interactive HTML/CSS/JS demos
- Use modern CSS animations and transitions
- Make it visually appealing with gradients, shadows, and modern design
- Include interactive elements that respond to user actions
- Ensure the simulation tells a story or demonstrates a process
- Use vanilla JavaScript (no external dependencies)
- Make it self-contained in a single HTML file`;
  }

  async execute(query: string, stateManager: any, context?: Record<string, any>) {
    const startTime = Date.now();
    
    try {
      stateManager.setAgentStatus(this.agentType, 'running');

      // Generate the multi-agent system visualization HTML
      const htmlContent = this.generateAgentVisualization();
      
      // Save to public directory
      const outputDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, 'agent-simulation.html');
      fs.writeFileSync(outputPath, htmlContent);

      const result = {
        agentType: this.agentType,
        content: `Created interactive multi-agent system visualization at: /agent-simulation.html

The visualization includes:
- Animated agent network showing all 7 sub-agents
- Real-time simulation of query processing
- Visual data flow between supervisor and agents
- Parallel execution demonstration
- Interactive controls to trigger different scenarios

Open http://localhost:3000/agent-simulation.html to view the simulation.`,
        metadata: { 
          outputPath: '/agent-simulation.html',
          fileSize: htmlContent.length,
          type: 'interactive_visualization',
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

  private generateAgentVisualization(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Agent System Simulation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #fff;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        h1 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
            background: linear-gradient(90deg, #00f2ff, #ff007a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            text-align: center;
            color: #888;
            margin-bottom: 30px;
        }

        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-primary {
            background: linear-gradient(45deg, #ff007a, #7000ff);
            color: white;
            box-shadow: 0 4px 15px rgba(255, 0, 122, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .network {
            position: relative;
            width: 100%;
            height: 600px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            overflow: hidden;
        }

        .node {
            position: absolute;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 3px solid transparent;
        }

        .node.supervisor {
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #ff007a, #7000ff);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            box-shadow: 0 0 40px rgba(255, 0, 122, 0.5);
        }

        .node.agent {
            background: linear-gradient(135deg, #00f2ff, #0080ff);
            box-shadow: 0 4px 15px rgba(0, 242, 255, 0.3);
        }

        .node.agent:nth-child(2) { top: 10%; left: 50%; transform: translateX(-50%); }
        .node.agent:nth-child(3) { top: 25%; right: 10%; }
        .node.agent:nth-child(4) { bottom: 25%; right: 10%; }
        .node.agent:nth-child(5) { bottom: 10%; left: 50%; transform: translateX(-50%); }
        .node.agent:nth-child(6) { bottom: 25%; left: 10%; }
        .node.agent:nth-child(7) { top: 25%; left: 10%; }
        .node.agent:nth-child(8) { top: 50%; right: 5%; transform: translateY(-50%); }

        .node.active {
            animation: pulse 1s ease-in-out infinite;
            border-color: #fff;
        }

        .node.processing {
            animation: spin 2s linear infinite;
        }

        .node.completed {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
        }

        .node.error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .node-icon {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .connection {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            transform-origin: left center;
            z-index: 1;
        }

        .data-packet {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00f2ff;
            box-shadow: 0 0 10px #00f2ff;
            z-index: 5;
            display: none;
        }

        .data-packet.active {
            display: block;
            animation: flow 1.5s linear forwards;
        }

        @keyframes flow {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }

        .log-panel {
            margin-top: 30px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 20px;
            max-height: 250px;
            overflow-y: auto;
        }

        .log-entry {
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .log-entry.info { background: rgba(0, 242, 255, 0.1); border-left: 3px solid #00f2ff; }
        .log-entry.success { background: rgba(34, 197, 94, 0.1); border-left: 3px solid #22c55e; }
        .log-entry.error { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; }
        .log-entry.processing { background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #00f2ff;
        }

        .stat-label {
            font-size: 12px;
            color: #888;
            margin-top: 5px;
        }

        .query-input {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 30px;
            display: block;
            padding: 15px 20px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            background: rgba(0, 0, 0, 0.3);
            color: white;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }

        .query-input:focus {
            border-color: #ff007a;
        }

        .result-panel {
            margin-top: 20px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            display: none;
        }

        .result-panel.show {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .agent-result {
            padding: 10px;
            margin: 10px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 3px solid #7000ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Multi-Agent System</h1>
        <p class="subtitle">Visual simulation of parallel agent orchestration</p>

        <input type="text" class="query-input" id="queryInput" 
               placeholder="Enter a query (e.g., 'Research AI trends and create a summary')" 
               value="Research the latest AI trends and create a visual summary">

        <div class="controls">
            <button class="btn btn-primary" onclick="startSimulation()">🚀 Run Simulation</button>
            <button class="btn btn-secondary" onclick="resetSimulation()">🔄 Reset</button>
            <button class="btn btn-secondary" onclick="runDemo()">▶️ Demo Mode</button>
        </div>

        <div class="network" id="network">
            <!-- Supervisor -->
            <div class="node supervisor" id="supervisor">
                <div class="node-icon">🎯</div>
                <div>Supervisor</div>
            </div>

            <!-- Agents -->
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
            <div class="node agent" id="agent-uiux" data-agent="uiux">
                <div class="node-icon">🎨</div>
                <div>UI/UX</div>
            </div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" id="activeAgents">0</div>
                <div class="stat-label">Active Agents</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="completedTasks">0</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalTime">0s</div>
                <div class="stat-label">Total Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="queryCount">0</div>
                <div class="stat-label">Queries</div>
            </div>
        </div>

        <div class="log-panel" id="logPanel">
            <div class="log-entry info">System ready. Enter a query and click Run Simulation.</div>
        </div>

        <div class="result-panel" id="resultPanel">
            <h3>📋 Results</h3>
            <div id="resultsContent"></div>
        </div>
    </div>

    <script>
        let isRunning = false;
        let queryCount = 0;
        let startTime = null;

        const agents = ['chat', 'web', 'research', 'mermaid', 'pdf', 'markdown', 'uiux'];
        const agentNames = {
            chat: 'Chat Agent',
            web: 'Web Search Agent',
            research: 'Research Agent',
            mermaid: 'Mermaid Agent',
            pdf: 'PDF Agent',
            markdown: 'Markdown Agent',
            uiux: 'UI/UX Agent'
        };

        function log(message, type = 'info') {
            const panel = document.getElementById('logPanel');
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            panel.insertBefore(entry, panel.firstChild);
            
            // Keep only last 50 entries
            while (panel.children.length > 50) {
                panel.removeChild(panel.lastChild);
            }
        }

        function setAgentStatus(agentId, status) {
            const agent = document.getElementById(`agent-${agentId}`);
            if (!agent) return;

            agent.classList.remove('active', 'processing', 'completed', 'error');
            
            if (status === 'active') {
                agent.classList.add('active');
            } else if (status === 'processing') {
                agent.classList.add('processing');
            } else if (status === 'completed') {
                agent.classList.add('completed');
            } else if (status === 'error') {
                agent.classList.add('error');
            }
        }

        function setSupervisorStatus(status) {
            const supervisor = document.getElementById('supervisor');
            supervisor.classList.remove('active', 'processing');
            
            if (status === 'active') {
                supervisor.classList.add('active');
            } else if (status === 'processing') {
                supervisor.classList.add('processing');
            }
        }

        function updateStats(active, completed) {
            document.getElementById('activeAgents').textContent = active;
            document.getElementById('completedTasks').textContent = completed;
            
            if (startTime) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                document.getElementById('totalTime').textContent = elapsed + 's';
            }
        }

        async function startSimulation() {
            if (isRunning) return;
            
            const query = document.getElementById('queryInput').value;
            if (!query.trim()) {
                log('Please enter a query first', 'error');
                return;
            }

            isRunning = true;
            queryCount++;
            document.getElementById('queryCount').textContent = queryCount;
            startTime = Date.now();

            // Reset UI
            document.getElementById('resultPanel').classList.remove('show');
            document.getElementById('resultsContent').innerHTML = '';
            agents.forEach(a => setAgentStatus(a, ''));
            
            log(`Starting simulation for query: "${query}"`, 'info');
            
            // Phase 1: Supervisor receives query
            setSupervisorStatus('active');
            log('Supervisor received query', 'processing');
            await delay(800);
            
            // Phase 2: Supervisor routes to agents
            setSupervisorStatus('processing');
            log('Supervisor analyzing query and routing to agents...', 'processing');
            await delay(1000);
            
            // Determine which agents to activate based on query
            const selectedAgents = selectAgentsForQuery(query);
            log(`Selected agents: ${selectedAgents.map(a => agentNames[a]).join(', ')}`, 'info');
            
            // Phase 3: Activate all selected agents in parallel
            const agentPromises = selectedAgents.map(agentId => 
                runAgent(agentId, query)
            );
            
            // Wait for all agents to complete
            const results = await Promise.all(agentPromises);
            
            // Phase 4: Supervisor aggregates results
            log('All agents completed. Supervisor aggregating results...', 'processing');
            setSupervisorStatus('active');
            await delay(1000);
            
            // Show results
            displayResults(results);
            log('Simulation complete!', 'success');
            
            setSupervisorStatus('');
            isRunning = false;
            updateStats(0, selectedAgents.length);
        }

        function selectAgentsForQuery(query) {
            const q = query.toLowerCase();
            const selected = ['chat']; // Chat always included
            
            if (q.includes('search') || q.includes('find') || q.includes('look up')) {
                selected.push('web');
            }
            if (q.includes('research') || q.includes('analyze') || q.includes('study')) {
                selected.push('research');
            }
            if (q.includes('diagram') || q.includes('chart') || q.includes('flow')) {
                selected.push('mermaid');
            }
            if (q.includes('pdf') || q.includes('document') || q.includes('report')) {
                selected.push('pdf');
            }
            if (q.includes('markdown') || q.includes('readme') || q.includes('doc')) {
                selected.push('markdown');
            }
            if (q.includes('ui') || q.includes('ux') || q.includes('design') || q.includes('interface')) {
                selected.push('uiux');
            }
            
            // If no specific agents matched, include web and research
            if (selected.length === 1) {
                selected.push('web', 'research');
            }
            
            return [...new Set(selected)];
        }

        async function runAgent(agentId, query) {
            setAgentStatus(agentId, 'active');
            log(`${agentNames[agentId]} started processing`, 'processing');
            updateStats(agents.filter(a => document.getElementById(`agent-${a}`)?.classList.contains('active') || document.getElementById(`agent-${a}`)?.classList.contains('processing')).length, 0);
            
            await delay(500);
            setAgentStatus(agentId, 'processing');
            
            // Simulate processing time based on agent type
            const processingTime = 1500 + Math.random() * 2000;
            await delay(processingTime);
            
            // Generate mock result
            const result = generateMockResult(agentId, query);
            
            setAgentStatus(agentId, 'completed');
            log(`${agentNames[agentId]} completed in ${(processingTime/1000).toFixed(1)}s`, 'success');
            
            return { agentId, result, duration: processingTime };
        }

        function generateMockResult(agentId, query) {
            const results = {
                chat: `Direct response: Here's what I found about "${query}"...`,
                web: `Web search results:\n- Found 5 relevant sources\n- Top result: Example.com/article\n- Key findings summarized`,
                research: `Research analysis:\n- Analyzed 12 academic papers\n- Key trends identified\n- Comprehensive summary prepared`,
                mermaid: \`\`\`mermaid
graph TD
    A[User Query] --> B[Supervisor]
    B --> C[Agents]
    C --> D[Results]
\`\`\`,
                pdf: `PDF document generated:\n- 5 pages\n- Formatted with headers\n- Ready for download`,
                markdown: \`# Research Summary\\n\\n## Overview\\n${query}\\n\\n## Findings\\n- Point 1\\n- Point 2\\n\`,
                uiux: `React component generated:\n- Modern design\n- Responsive layout\n- TypeScript included`
            };
            return results[agentId] || 'Task completed successfully';
        }

        function displayResults(results) {
            const panel = document.getElementById('resultPanel');
            const content = document.getElementById('resultsContent');
            
            content.innerHTML = results.map(r => \`
                <div class="agent-result">
                    <strong>🤖 ${agentNames[r.agentId]}</strong>
                    <span style="float: right; color: #888;">${(r.duration/1000).toFixed(1)}s</span>
                    <pre style="margin-top: 10px; white-space: pre-wrap; font-size: 12px;">${r.result}</pre>
                </div>
            \`).join('');
            
            panel.classList.add('show');
        }

        function resetSimulation() {
            isRunning = false;
            agents.forEach(a => setAgentStatus(a, ''));
            setSupervisorStatus('');
            document.getElementById('resultPanel').classList.remove('show');
            document.getElementById('logPanel').innerHTML = '<div class="log-entry info">System ready. Enter a query and click Run Simulation.</div>';
            updateStats(0, 0);
            startTime = null;
            log('Simulation reset', 'info');
        }

        async function runDemo() {
            document.getElementById('queryInput').value = 'Research AI trends and create a visual summary with diagrams';
            await startSimulation();
        }

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Auto-run demo on first load
        window.addEventListener('load', () => {
            setTimeout(() => {
                log('Welcome! This simulation demonstrates a multi-agent system.', 'info');
                log('The Supervisor routes queries to specialized agents in parallel.', 'info');
            }, 500);
        });
    </script>
</body>
</html>`;
  }
}
