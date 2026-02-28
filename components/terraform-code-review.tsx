'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  FileCode, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function TerraformCodeReview() {
  const { generatedHCL, agentStatuses, validationReport } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  
  const isGenerated = agentStatuses.generator === 'completed';
  const isValidated = agentStatuses.validator === 'completed';

  if (!isGenerated || !generatedHCL) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Terraform Code Review
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHCL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHCL], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.tf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full border-amber-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5 text-amber-500" />
            Terraform Code Review
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={isValidated && validationReport?.passed ? 'default' : 'secondary'}>
            {isValidated && validationReport?.passed ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Validated</>
            ) : (
              'Pending Validation'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Human Review Required</p>
            <p className="text-muted-foreground">
              This Terraform code will be executed in your AWS account. 
              Review carefully before approving.
            </p>
          </div>
        </div>

        <ScrollArea className="h-[350px]">
          <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <code>{generatedHCL}</code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
