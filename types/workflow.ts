// types/workflow.ts
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting_approval';
export type Environment = 'dev' | 'staging' | 'prod';

export interface WorkflowState {
  currentStep: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  userPrompt: string;
  environment: Environment;
  region: string;
  
  // Agent outputs
  infrastructurePlan?: InfrastructurePlan;
  generatedHCL?: string;
  validationReport?: ValidationReport;
  costEstimate?: CostEstimate;
  approvalDecision?: ApprovalDecision;
  deploymentResult?: DeploymentResult;
  
  // Agent statuses
  agentStatuses: Record<string, AgentStatus>;
  
  // Logs
  logs: LogEntry[];
}

export interface InfrastructurePlan {
  version: string;
  environment: string;
  region: string;
  resources: Resource[];
  dependencies: Record<string, Dependency>;
  tags: Record<string, string>;
}

export interface Resource {
  type: string;
  name: string;
  engine?: string;
  instance_class?: string;
  allocated_storage?: number;
  dependencies?: string[];
}

export interface Dependency {
  type: string;
  name: string;
  subnet_ids?: string[];
}

export interface ValidationReport {
  passed: boolean;
  terraform_valid: boolean;
  security_issues: SecurityIssue[];
  policy_violations?: PolicyViolation[];
}

export interface SecurityIssue {
  check_id: string;
  check_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resource: string;
  guideline?: string;
}

export interface PolicyViolation {
  message: string;
  policy: string;
}

export interface CostEstimate {
  monthly_total: number;
  annual_total: number;
  breakdown: CostBreakdown[];
  environment_comparison?: EnvironmentComparison;
}

export interface CostBreakdown {
  service: string;
  monthly_estimate: number;
  details: string;
}

export interface EnvironmentComparison {
  dev: number;
  staging: number;
  prod: number;
}

export interface ApprovalDecision {
  status: 'approved' | 'rejected';
  approver?: string;
  comment?: string;
  timestamp: string;
}

export interface DeploymentResult {
  success: boolean;
  logs: string;
  resources_created?: string[];
  verification_status?: 'passed' | 'failed';
}

export interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const AGENTS = [
  { id: 'planner', name: 'Planner', description: 'Converts natural language to structured infrastructure plan' },
  { id: 'generator', name: 'Generator', description: 'Produces validated Terraform HCL' },
  { id: 'validator', name: 'Validator', description: 'Runs syntax, security, and policy checks' },
  { id: 'cost_estimator', name: 'Cost Estimator', description: 'Calculates AWS infrastructure costs' },
  { id: 'approval', name: 'Human Approval', description: 'Mandatory authorization gate' },
  { id: 'deployer', name: 'Deployer', description: 'Executes terraform apply' },
] as const;
