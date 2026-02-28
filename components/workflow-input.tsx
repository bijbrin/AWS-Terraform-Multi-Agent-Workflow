'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore, AGENTS } from '@/store/workflow-store';
import { Play, RotateCcw, Terminal, Globe, Server, AlertTriangle, Key, Eye, EyeOff, Cloud } from 'lucide-react';
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
  const { userPrompt, environment, region, awsCredentials, status, setUserPrompt, setEnvironment, setRegion, setAwsCredentials, startWorkflow, reset } = useWorkflowStore();
  const [isStarting, setIsStarting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'credentials'>('request');

  const handleStart = async () => {
    if (!userPrompt.trim()) return;
    if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey) {
      setActiveTab('credentials');
      return;
    }
    setIsStarting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    startWorkflow();
    setIsStarting(false);
  };

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const hasCredentials = awsCredentials.accessKeyId && awsCredentials.secretAccessKey;

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
        <div className="flex border-b">
          <button onClick={() => setActiveTab('request')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'request' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            Infrastructure
          </button>
          <button onClick={() => setActiveTab('credentials')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'credentials' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'} ${!hasCredentials ? 'text-amber-500' : ''}`}>
            <Key className="h-3 w-3" />
            AWS Credentials
            {!hasCredentials && <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </button>
        </div>

        {activeTab === 'request' ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {ENVIRONMENTS.map((env) => (
                <button key={env.value} onClick={() => setEnvironment(env.value)} disabled={isRunning || isPaused} className={`relative p-3 rounded-lg border text-left transition-all ${environment === env.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'} ${isRunning || isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${env.color}`} />
                    <span className="font-medium text-sm">{env.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select value={region} onChange={(e) => setRegion(e.target.value)} disabled={isRunning || isPaused} className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50">
                {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4" />Infrastructure Requirements</label>
              <Textarea placeholder="Describe infrastructure..." value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} disabled={isRunning || isPaused} className="mt-1 min-h-[100px]" />
            </div>

            {hasCredentials && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">AWS Account Configured</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Access Key: {awsCredentials.accessKeyId.slice(0, 8)}... | Region: {region}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-amber-700">Security Notice</p>
                  <p>Credentials are stored in memory only and never logged. Always use IAM credentials with minimal permissions.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">AWS Access Key ID</label>
              <Input placeholder="AKIA..." value={awsCredentials.accessKeyId} onChange={(e) => setAwsCredentials({ ...awsCredentials, accessKeyId: e.target.value })} className="mt-1 font-mono" />
            </div>

            <div>
              <label className="text-sm font-medium">AWS Secret Access Key</label>
              <div className="relative mt-1">
                <Input type={showSecretKey ? 'text' : 'password'} placeholder="Enter secret key..." value={awsCredentials.secretAccessKey} onChange={(e) => setAwsCredentials({ ...awsCredentials, secretAccessKey: e.target.value })} className="font-mono pr-10" />
                <button onClick={() => setShowSecretKey(!showSecretKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-muted-foreground">
              <p className="font-medium text-blue-700">Required IAM Permissions:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>ec2:Describe*, ec2:Create*, ec2:Delete*</li>
                <li>rds:Describe*, rds:Create*, rds:Delete*</li>
                <li>iam:PassRole, iam:GetRole</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">This workflow includes a <strong>mandatory human approval gate</strong> before any infrastructure is deployed.</p>
        </div>

        <Button className="w-full" size="lg" onClick={handleStart} disabled={!userPrompt.trim() || isRunning || isPaused || isStarting}>
          {isStarting ? <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Starting...</> : <><Play className="h-4 w-4 mr-2" />Start Workflow</>}
        </Button>
      </CardContent>
    </Card>
  );
}
