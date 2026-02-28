'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  Server, 
  Database, 
  Network, 
  Shield,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const resourceIcons: Record<string, React.ReactNode> = {
  aws_vpc: <Network className="h-4 w-4" />,
  aws_subnet: <Network className="h-4 w-4" />,
  aws_db_instance: <Database className="h-4 w-4" />,
  aws_db_subnet_group: <Network className="h-4 w-4" />,
  aws_ec2_instance: <Server className="h-4 w-4" />,
  aws_s3_bucket: <Database className="h-4 w-4" />,
  aws_security_group: <Shield className="h-4 w-4" />,
};

export function InfrastructurePlanView() {
  const { infrastructurePlan, agentStatuses } = useWorkflowStore();
  const isGenerated = agentStatuses.planner === 'completed';

  if (!isGenerated || !infrastructurePlan) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Infrastructure Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for Planner agent...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Infrastructure Plan</CardTitle>
          <Badge variant="outline">
            {infrastructurePlan.environment} | {infrastructurePlan.region}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Resources ({infrastructurePlan.resources.length})</h4>
          <div className="space-y-2">
            {infrastructurePlan.resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded border bg-muted/50"
              >
                <span className="text-muted-foreground">
                  {resourceIcons[resource.type] || <Server className="h-4 w-4" />}
                </span>
                <span className="font-mono text-sm">{resource.type}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{resource.name}</span>
                {resource.instance_class && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {resource.instance_class}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(infrastructurePlan.tags).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ValidationReportView() {
  const { validationReport, agentStatuses } = useWorkflowStore();
  const isValidated = agentStatuses.validator === 'completed';

  if (!isValidated || !validationReport) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Validation Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for Validator agent...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Validation Report</CardTitle>
          <Badge
            variant={validationReport.passed ? 'default' : 'destructive'}
            className={validationReport.passed ? 'bg-green-500' : ''}
          >
            {validationReport.passed ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Passed</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" /> Failed</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Terraform Validate</p>
            <p className="font-medium">
              {validationReport.terraform_valid ? '✓ Valid' : '✗ Invalid'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Security Issues</p>
            <p className="font-medium">{validationReport.security_issues.length} found</p>
          </div>
        </div>

        {validationReport.security_issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Security Findings</h4>
            <div className="space-y-2">
              {validationReport.security_issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-sm ${
                    issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-amber-500/50 bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        issue.severity === 'CRITICAL'
                          ? 'border-red-500 text-red-500'
                          : issue.severity === 'HIGH'
                          ? 'border-orange-500 text-orange-500'
                          : 'border-amber-500 text-amber-500'
                      }
                    >
                      {issue.severity}
                    </Badge>
                    <span className="font-mono text-xs">{issue.check_id}</span>
                  </div>
                  <p className="mt-1 font-medium">{issue.check_name}</p>
                  <p className="text-muted-foreground">{issue.resource}</p>
                  {issue.guideline && (
                    <p className="text-xs mt-1">💡 {issue.guideline}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
