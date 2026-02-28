'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentPipeline } from '@/components/agent-pipeline';
import { WorkflowLogs } from '@/components/workflow-logs';
import { WorkflowInput } from '@/components/workflow-input';
import { InfrastructurePlanView, ValidationReportView } from '@/components/infrastructure-views';
import { CostEstimateView } from '@/components/cost-estimate-view';
import { ApprovalGate } from '@/components/approval-gate';
import { DeploymentResult } from '@/components/deployment-result';
import { TerraformCodeView } from '@/components/terraform-code-view';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  Bot, 
  FileText, 
  Shield, 
  DollarSign, 
  UserCheck, 
  Rocket,
  LayoutGrid,
  Terminal,
  FileCode
} from 'lucide-react';

export function WorkflowDashboard() {
  const { status, agentStatuses } = useWorkflowStore();
  
  const hasPlan = agentStatuses.planner === 'completed';
  const hasValidation = agentStatuses.validator === 'completed';
  const hasCost = agentStatuses.cost_estimator === 'completed';
  const isWaitingApproval = agentStatuses.approval === 'waiting_approval';
  const isApproved = agentStatuses.approval === 'completed';
  const isDeployed = agentStatuses.deployer === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AWS Terraform Multi-Agent Workflow
          </h1>
          <p className="text-muted-foreground">
            Production-grade infrastructure automation with mandatory human approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'idle' ? 'bg-muted text-muted-foreground' :
            status === 'running' ? 'bg-blue-500/10 text-blue-500' :
            status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
            status === 'completed' ? 'bg-green-500/10 text-green-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Input & Pipeline */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <WorkflowInput />
          <AgentPipeline />
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="col-span-12 lg:col-span-8">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="terraform" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Terraform
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center gap-2" disabled={!isWaitingApproval && !isApproved}>
                <UserCheck className="h-4 w-4" />
                Approval
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfrastructurePlanView />
                <ValidationReportView />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CostEstimateView />
                {isWaitingApproval || isApproved ? (
                  <ApprovalGate />
                ) : isDeployed ? (
                  <DeploymentResult />
                ) : (
                  <div className="h-full min-h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">
                      {status === 'idle' 
                        ? 'Start a workflow to see results here'
                        : 'Continue through the pipeline to reach approval'
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="terraform">
              <TerraformCodeView />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <InfrastructurePlanView />
                <ValidationReportView />
                <CostEstimateView />
                {(isWaitingApproval || isApproved) && <ApprovalGate />}
                {isDeployed && <DeploymentResult />}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <WorkflowLogs />
            </TabsContent>

            <TabsContent value="approval">
              <ApprovalGate />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
