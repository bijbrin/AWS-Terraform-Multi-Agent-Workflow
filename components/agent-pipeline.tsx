'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore, AGENTS } from '@/store/workflow-store';
import { 
  Bot, 
  FileText, 
  Shield, 
  DollarSign, 
  UserCheck, 
  Rocket,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  planner: <Bot className="h-5 w-5" />,
  generator: <FileText className="h-5 w-5" />,
  validator: <Shield className="h-5 w-5" />,
  cost_estimator: <DollarSign className="h-5 w-5" />,
  approval: <UserCheck className="h-5 w-5" />,
  deployer: <Rocket className="h-5 w-5" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  idle: <Clock className="h-4 w-4 text-muted-foreground" />,
  running: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  waiting_approval: <Clock className="h-4 w-4 text-amber-500" />,
};

const statusColors: Record<string, string> = {
  idle: 'bg-muted text-muted-foreground',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  waiting_approval: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export function AgentPipeline() {
  const { currentStep, agentStatuses } = useWorkflowStore();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Agent Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {AGENTS.map((agent, index) => {
              const status = agentStatuses[agent.id];
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              
              return (
                <div
                  key={agent.id}
                  className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border'
                  } ${isPast ? 'opacity-70' : ''}`}
                >
                  {/* Step number / connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isPast
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted bg-muted'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < AGENTS.length - 1 && (
                      <div
                        className={`w-0.5 h-6 mt-1 ${
                          isPast ? 'bg-green-500' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Agent info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{agentIcons[agent.id]}</div>
                      <span className="font-medium">{agent.name}</span>
                      <Badge
                        variant="outline"
                        className={`ml-auto text-xs ${statusColors[status]}`}
                      >
                        <span className="flex items-center gap-1">
                          {statusIcons[status]}
                          {status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
