'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore, AGENTS } from '@/store/workflow-store';
import { 
  Play, 
  RotateCcw, 
  Terminal,
  Globe,
  Server,
  AlertTriangle
} from 'lucide-react';
import type { Environment } from '@/types/workflow';

const ENVIRONMENTS: { value: Environment; label: string; color: string }[] = [
  { value: 'dev', label: 'Development', color: 'bg-blue-500' },
  { value: 'staging', label: 'Staging', color: 'bg-amber-500' },
  { value: 'prod', label: 'Production', color: 'bg-red-500' },
];

const REGIONS = [
  { value: 'ap-southeast-2', label: 'Sydney (ap-southeast-2)' },
  { value: 'us-east-1', label: 'N. Virginia (us-east-1)' },
  { value: 'us-west-2', label: 'Oregon (us-west-2)' },
  { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
  { value: 'ap-northeast-1', label: 'Tokyo (ap-northeast-1)' },
];

export function WorkflowInput() {
  const { 
    userPrompt, 
    environment, 
    region,
    status,
    setUserPrompt, 
    setEnvironment, 
    setRegion,
    startWorkflow,
    reset
  } = useWorkflowStore();
  
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!userPrompt.trim()) return;
    setIsStarting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    startWorkflow();
    setIsStarting(false);
  };

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            New Infrastructure Request
          </CardTitle>
          {(isPaused || isCompleted) && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Selection */}
        <div className="grid grid-cols-3 gap-3">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.value}
              onClick={() => setEnvironment(env.value)}
              disabled={isRunning || isPaused}
              className={`relative p-3 rounded-lg border text-left transition-all ${
                environment === env.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              } ${isRunning || isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${env.color}`} />
                <span className="font-medium text-sm">{env.label}</span>
              </div>
              {environment === env.value && (
                <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                  Selected
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Region Selection */}
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={isRunning || isPaused}
            className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Infrastructure Requirements
          </label>
          <Textarea
            placeholder="Describe the infrastructure you want to provision...&#10;&#10;Example: Create a PostgreSQL database with VPC, private subnets, and security groups for a web application"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isRunning || isPaused}
            className="mt-1 min-h-[100px]"
          />
        </div>

        {/* Safety Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            This workflow includes a <strong>mandatory human approval gate</strong> before any 
            infrastructure is deployed. All changes are validated for security and cost before 
            requiring your explicit authorization.
          </p>
        </div>

        {/* Start Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleStart}
          disabled={!userPrompt.trim() || isRunning || isPaused || isStarting}
        >
          {isStarting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Workflow
            </>
          )}
        </Button>

        {/* Pipeline Preview */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">Pipeline: {AGENTS.length} stages</p>
          <div className="flex items-center gap-1">
            {AGENTS.map((agent, index) => (
              <div key={agent.id} className="flex items-center">
                <div
                  className="h-1.5 w-8 rounded-full bg-muted"
                  title={agent.name}
                />
                {index < AGENTS.length - 1 && (
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
