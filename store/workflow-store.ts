// store/workflow-store.ts
import { create } from 'zustand';
import type { 
  WorkflowState, 
  InfrastructurePlan, 
  ValidationReport, 
  CostEstimate,
  ApprovalDecision,
  DeploymentResult,
  LogEntry,
  Environment 
} from '@/types/workflow';

// Re-export AGENTS for use in components
export { AGENTS } from '@/types/workflow';

interface WorkflowStore extends WorkflowState {
  setUserPrompt: (prompt: string) => void;
  setEnvironment: (env: Environment) => void;
  setRegion: (region: string) => void;
  setAgentStatus: (agent: string, status: WorkflowState['agentStatuses'][string]) => void;
  setInfrastructurePlan: (plan: InfrastructurePlan) => void;
  setGeneratedHCL: (hcl: string) => void;
  setValidationReport: (report: ValidationReport) => void;
  setCostEstimate: (estimate: CostEstimate) => void;
  setApprovalDecision: (decision: ApprovalDecision) => void;
  setDeploymentResult: (result: DeploymentResult) => void;
  addLog: (agent: string, message: string, type: LogEntry['type']) => void;
  setCurrentStep: (step: number) => void;
  setStatus: (status: WorkflowState['status']) => void;
  reset: () => void;
  startWorkflow: () => void;
  approveDeployment: (comment?: string) => void;
  rejectDeployment: (reason: string) => void;
}

const initialState: Omit<WorkflowStore, 
  'setUserPrompt' | 'setEnvironment' | 'setRegion' | 'setAgentStatus' | 
  'setInfrastructurePlan' | 'setGeneratedHCL' | 'setValidationReport' | 
  'setCostEstimate' | 'setApprovalDecision' | 'setDeploymentResult' | 
  'addLog' | 'setCurrentStep' | 'setStatus' | 'reset' | 'startWorkflow' | 
  'approveDeployment' | 'rejectDeployment'
> = {
  currentStep: 0,
  status: 'idle',
  userPrompt: '',
  environment: 'dev',
  region: 'ap-southeast-2',
  agentStatuses: {
    planner: 'idle',
    generator: 'idle',
    validator: 'idle',
    cost_estimator: 'idle',
    approval: 'idle',
    deployer: 'idle',
  },
  logs: [],
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  setUserPrompt: (prompt) => set({ userPrompt: prompt }),
  setEnvironment: (env) => set({ environment: env }),
  setRegion: (region) => set({ region }),
  
  setAgentStatus: (agent, status) => set((state) => ({
    agentStatuses: { ...state.agentStatuses, [agent]: status }
  })),
  
  setInfrastructurePlan: (plan) => set({ infrastructurePlan: plan }),
  setGeneratedHCL: (hcl) => set({ generatedHCL: hcl }),
  setValidationReport: (report) => set({ validationReport: report }),
  setCostEstimate: (estimate) => set({ costEstimate: estimate }),
  setApprovalDecision: (decision) => set({ approvalDecision: decision }),
  setDeploymentResult: (result) => set({ deploymentResult: result }),
  
  addLog: (agent, message, type = 'info') => set((state) => ({
    logs: [...state.logs, {
      timestamp: new Date().toISOString(),
      agent,
      message,
      type
    }]
  })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  setStatus: (status) => set({ status }),
  
  reset: () => set({ ...initialState }),
  
  startWorkflow: () => {
    const { userPrompt, environment, region, addLog, setAgentStatus, setCurrentStep, setStatus } = get();
    
    if (!userPrompt.trim()) return;
    
    setStatus('running');
    setCurrentStep(0);
    addLog('system', `Starting workflow for: "${userPrompt}"`, 'info');
    addLog('system', `Target environment: ${environment} (${region})`, 'info');
    
    // Simulate workflow progression
    simulateWorkflow(get, set);
  },
  
  approveDeployment: (comment = '') => {
    const { addLog, setAgentStatus, setApprovalDecision } = get();
    
    const decision: ApprovalDecision = {
      status: 'approved',
      approver: 'user@example.com',
      comment,
      timestamp: new Date().toISOString()
    };
    
    setApprovalDecision(decision);
    setAgentStatus('approval', 'completed');
    addLog('approval', 'Deployment approved by user', 'success');
    
    // Continue to deployer
    simulateDeployer(get, set);
  },
  
  rejectDeployment: (reason) => {
    const { addLog, setAgentStatus, setApprovalDecision, setStatus } = get();
    
    const decision: ApprovalDecision = {
      status: 'rejected',
      comment: reason,
      timestamp: new Date().toISOString()
    };
    
    setApprovalDecision(decision);
    setAgentStatus('approval', 'error');
    setStatus('error');
    addLog('approval', `Deployment rejected: ${reason}`, 'error');
  }
}));

// Simulation functions for demo purposes
async function simulateWorkflow(get: () => WorkflowStore, set: any) {
  const { addLog, setAgentStatus, setCurrentStep, setInfrastructurePlan, 
          setGeneratedHCL, setValidationReport, setCostEstimate, setStatus } = get();
  
  // Step 1: Planner
  setAgentStatus('planner', 'running');
  addLog('planner', 'Analyzing user requirements...', 'info');
  await delay(1500);
  
  const mockPlan: InfrastructurePlan = {
    version: '1.0',
    environment: get().environment,
    region: get().region,
    resources: [
      { type: 'aws_vpc', name: 'main_vpc', dependencies: [] },
      { type: 'aws_subnet', name: 'private_a', dependencies: ['aws_vpc.main_vpc'] },
      { type: 'aws_subnet', name: 'private_b', dependencies: ['aws_vpc.main_vpc'] },
      { type: 'aws_db_instance', name: 'postgres_db', engine: 'postgres', instance_class: 'db.t3.micro', allocated_storage: 20, dependencies: ['aws_db_subnet_group.main'] },
    ],
    dependencies: {
      'aws_db_subnet_group.main': { type: 'aws_db_subnet_group', name: 'main', subnet_ids: ['${aws_subnet.private_a.id}', '${aws_subnet.private_b.id}'] }
    },
    tags: { Project: 'infrastructure-automation', ManagedBy: 'terraform-agent' }
  };
  
  setInfrastructurePlan(mockPlan);
  setAgentStatus('planner', 'completed');
  addLog('planner', `Generated plan with ${mockPlan.resources.length} resources`, 'success');
  setCurrentStep(1);
  
  // Step 2: Generator
  setAgentStatus('generator', 'running');
  addLog('generator', 'Generating Terraform HCL...', 'info');
  await delay(2000);
  
  const mockHCL = `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${get().region}"
  default_tags {
    tags = {
      Environment = "${get().environment}"
      ManagedBy   = "terraform-agent"
    }
  }
}

resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "main-vpc" }
}

resource "aws_db_instance" "postgres_db" {
  identifier        = "postgres-db"
  engine            = "postgres"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_encrypted = true
}`;
  
  setGeneratedHCL(mockHCL);
  setAgentStatus('generator', 'completed');
  addLog('generator', 'HCL generated and validated', 'success');
  setCurrentStep(2);
  
  // Step 3: Validator
  setAgentStatus('validator', 'running');
  addLog('validator', 'Running terraform validate...', 'info');
  await delay(1000);
  addLog('validator', 'Syntax validation passed', 'success');
  
  addLog('validator', 'Running Checkov security scan...', 'info');
  await delay(1500);
  
  const mockValidation: ValidationReport = {
    passed: true,
    terraform_valid: true,
    security_issues: [
      { check_id: 'CKV_AWS_16', check_name: 'RDS encryption', severity: 'HIGH', resource: 'aws_db_instance.postgres_db', guideline: 'Ensure storage_encrypted is true' }
    ]
  };
  
  setValidationReport(mockValidation);
  setAgentStatus('validator', 'completed');
  addLog('validator', 'Security scan completed: 1 low-priority finding', 'warning');
  setCurrentStep(3);
  
  // Step 4: Cost Estimator
  setAgentStatus('cost_estimator', 'running');
  addLog('cost_estimator', 'Generating terraform plan...', 'info');
  await delay(1000);
  addLog('cost_estimator', 'Querying AWS Pricing API...', 'info');
  await delay(1500);
  
  const mockCost: CostEstimate = {
    monthly_total: 45.67,
    annual_total: 548.04,
    breakdown: [
      { service: 'RDS PostgreSQL (db.t3.micro)', monthly_estimate: 28.50, details: 'Single-AZ, 20GB storage' },
      { service: 'VPC (no NAT Gateway)', monthly_estimate: 0.00, details: 'No data transfer charges' },
      { service: 'Data Transfer', monthly_estimate: 17.17, details: 'Estimated outbound traffic' }
    ],
    environment_comparison: { dev: 45.67, staging: 180.50, prod: 890.25 }
  };
  
  setCostEstimate(mockCost);
  setAgentStatus('cost_estimator', 'completed');
  addLog('cost_estimator', `Estimated monthly cost: $${mockCost.monthly_total}`, 'success');
  setCurrentStep(4);
  
  // Step 5: Approval (pause for human)
  setAgentStatus('approval', 'waiting_approval');
  setStatus('paused');
  addLog('approval', 'Waiting for human approval...', 'warning');
}

async function simulateDeployer(get: () => WorkflowStore, set: any) {
  const { addLog, setAgentStatus, setDeploymentResult, setCurrentStep, setStatus } = get();
  
  setStatus('running');
  setCurrentStep(5);
  setAgentStatus('deployer', 'running');
  
  addLog('deployer', 'Verifying plan file hash...', 'info');
  await delay(800);
  addLog('deployer', 'Hash verified - plan matches approved version', 'success');
  
  addLog('deployer', 'Checking for state locks...', 'info');
  await delay(600);
  addLog('deployer', 'No locks detected - proceeding with apply', 'success');
  
  addLog('deployer', 'Executing terraform apply...', 'info');
  await delay(2500);
  
  const mockResult: DeploymentResult = {
    success: true,
    logs: `aws_vpc.main_vpc: Creating...
aws_vpc.main_vpc: Creation complete after 3s [id=vpc-0abc123]
aws_db_instance.postgres_db: Creating...
aws_db_instance.postgres_db: Still creating... [10s elapsed]
aws_db_instance.postgres_db: Creation complete after 4m12s [id=db-xyz789]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.`,
    resources_created: ['vpc-0abc123', 'db-xyz789'],
    verification_status: 'passed'
  };
  
  setDeploymentResult(mockResult);
  setAgentStatus('deployer', 'completed');
  addLog('deployer', 'Deployment completed successfully', 'success');
  setStatus('completed');
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
