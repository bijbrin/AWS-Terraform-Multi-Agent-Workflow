'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/store/workflow-store';
import { Rocket, CheckCircle2, XCircle, Server } from 'lucide-react';

export function DeploymentResult() {
  const { deploymentResult, agentStatuses } = useWorkflowStore();
  const isDeployed = agentStatuses.deployer === 'completed';
  const isDeploying = agentStatuses.deployer === 'running';

  if (!isDeployed && !isDeploying) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for approval...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isDeploying) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 animate-bounce" />
            Deploying...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Executing terraform apply...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deploymentResult) return null;

  return (
    <Card className={`h-full ${deploymentResult.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {deploymentResult.success ? (
              <><CheckCircle2 className="h-5 w-5 text-green-500" /> Deployment Successful</>
            ) : (
              <><XCircle className="h-5 w-5 text-red-500" /> Deployment Failed</>
            )}
          </CardTitle>
          <Badge
            variant={deploymentResult.success ? 'default' : 'destructive'}
            className={deploymentResult.success ? 'bg-green-500' : ''}
          >
            {deploymentResult.success ? 'Success' : 'Failed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {deploymentResult.resources_created && deploymentResult.resources_created.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Resources Created
            </h4>
            <div className="flex flex-wrap gap-2">
              {deploymentResult.resources_created.map((id, i) => (
                <Badge key={i} variant="outline" className="font-mono text-xs">
                  {id}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Terraform Output</h4>
          <ScrollArea className="h-[200px]">
            <pre className="bg-muted p-3 rounded text-xs font-mono whitespace-pre-wrap">
              {deploymentResult.logs}
            </pre>
          </ScrollArea>
        </div>

        {deploymentResult.verification_status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Post-Deployment Verification:</span>
            <Badge
              variant={deploymentResult.verification_status === 'passed' ? 'default' : 'destructive'}
              className={deploymentResult.verification_status === 'passed' ? 'bg-green-500' : ''}
            >
              {deploymentResult.verification_status === 'passed' ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
