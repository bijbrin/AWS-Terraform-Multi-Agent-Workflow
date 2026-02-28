'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Terminal
} from 'lucide-react';

const typeIcons = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

const typeColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
};

export function WorkflowLogs() {
  const { logs } = useWorkflowStore();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Workflow Logs
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {logs.length} entries
        </span>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No logs yet. Start a workflow to see activity.
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded hover:bg-muted/50"
                >
                  <span className="text-muted-foreground text-xs shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={typeColors[log.type]}>{typeIcons[log.type]}</span>
                  <span className="text-muted-foreground shrink-0">[{log.agent}]</span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
