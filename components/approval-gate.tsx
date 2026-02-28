'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Shield,
  DollarSign,
  Cloud,
  FileCode
} from 'lucide-react';

export function ApprovalGate() {
  const { 
    agentStatuses, 
    costEstimate, 
    validationReport, 
    infrastructurePlan,
    awsCredentials,
    region,
    environment,
    approveDeployment,
    rejectDeployment
  } = useWorkflowStore();
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isWaitingApproval = agentStatuses.approval === 'waiting_approval';
  const isApproved = agentStatuses.approval === 'completed';
  const isRejected = agentStatuses.approval === 'error';

  if (!isWaitingApproval && !isApproved && !isRejected) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Human Approval Gate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for Cost Estimator to complete...
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    approveDeployment(comment);
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    rejectDeployment(comment);
    setIsSubmitting(false);
  };

  if (isApproved) {
    return (
      <Card className="h-full border-green-500/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Deployment Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Approved</AlertTitle>
            <AlertDescription>
              Proceeding to deployment...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isRejected) {
    return (
      <Card className="h-full border-red-500/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Deployment Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Rejected</AlertTitle>
            <AlertDescription>
              Deployment has been cancelled.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-amber-500/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-amber-500" />
          Human Approval Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-500/10 border-amber-500/50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Mandatory Approval Gate</AlertTitle>
          <AlertDescription>
            This deployment requires explicit human authorization before proceeding.
            Review the details below carefully.
          </AlertDescription>
        </Alert>

        {/* AWS Account Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Target AWS Account</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Account ID:</strong> {awsCredentials.accessKeyId ? `${awsCredentials.accessKeyId.slice(0, 8)}...` : 'Not configured'}</p>
            <p><strong>Region:</strong> {region}</p>
            <p><strong>Environment:</strong> {environment}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Validation
            </div>
            <Badge
              variant={validationReport?.passed ? 'default' : 'destructive'}
              className="mt-1"
            >
              {validationReport?.passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
          <div className="p-3 rounded border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Monthly Cost
            </div>
            <p className="font-mono font-medium mt-1">
              ${costEstimate?.monthly_total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Resources to create */}
        <div>
          <p className="text-sm font-medium mb-2">Resources to Create</p>
          <div className="flex flex-wrap gap-2">
            {infrastructurePlan?.resources.map((r, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {r.type}.{r.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Approval comment */}
        <div>
          <label className="text-sm font-medium">Approval Comment</label>
          <Textarea
            placeholder="Enter your approval comment or rejection reason..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleReject}
            disabled={isSubmitting || !comment.trim()}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve & Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
