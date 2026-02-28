'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/store/workflow-store';
import { FileCode, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function TerraformCodeView() {
  const { generatedHCL, agentStatuses, awsCredentials, region, environment } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  
  const isGenerated = agentStatuses.generator === 'completed';

  const getFullTerraformCode = () => {
    if (!generatedHCL) return '';
    
    return `# Terraform Configuration
# Generated for: ${environment} environment
# Target Region: ${region}
# AWS Account: ${awsCredentials.accessKeyId ? awsCredentials.accessKeyId.slice(0, 8) + '...' : 'Not configured'}

${generatedHCL}

# Provider configuration with credentials
provider "aws" {
  region     = "${region}"
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
  
  default_tags {
    tags = {
      Environment = "${environment}"
      ManagedBy   = "terraform-agent"
      GeneratedAt = "${new Date().toISOString()}"
    }
  }
}

# Variables for credentials (do not commit actual values)
variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullTerraformCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isGenerated || !generatedHCL) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Terraform Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for Generator agent...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Terraform Code
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              Validated
            </Badge>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : <><Copy className="h-3 w-3 mr-1" />Copy</>}
            </Button>
          </div>
        </div>      </CardHeader>
      <CardContent>
        <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-700 font-medium"><strong>Review this code carefully before approval.</strong> This will be deployed to:</p>
          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
            <li>AWS Account: {awsCredentials.accessKeyId ? `${awsCredentials.accessKeyId.slice(0, 8)}...` : 'Not configured'}</li>
            <li>Region: {region}</li>
            <li>Environment: {environment}</li>
          </ul>
        </div>
        
        <ScrollArea className="h-[300px]">
          <pre className="bg-muted p-4 rounded text-xs font-mono whitespace-pre-wrap">
            {getFullTerraformCode()}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
