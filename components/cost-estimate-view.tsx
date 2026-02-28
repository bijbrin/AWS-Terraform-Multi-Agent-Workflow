'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/store/workflow-store';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export function CostEstimateView() {
  const { costEstimate, agentStatuses, environment } = useWorkflowStore();
  const isEstimated = agentStatuses.cost_estimator === 'completed';

  if (!isEstimated || !costEstimate) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Cost Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Waiting for Cost Estimator agent...
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Estimate
          </CardTitle>
          <Badge variant="outline">{environment}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Monthly Estimate</p>
            <p className="text-2xl font-bold">{formatCurrency(costEstimate.monthly_total)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Annual Estimate</p>
            <p className="text-2xl font-bold">{formatCurrency(costEstimate.annual_total)}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Cost Breakdown
          </h4>
          <div className="space-y-2">
            {costEstimate.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div>
                  <p className="font-medium text-sm">{item.service}</p>
                  <p className="text-xs text-muted-foreground">{item.details}</p>
                </div>
                <span className="font-mono font-medium">
                  {formatCurrency(item.monthly_estimate)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Comparison */}
        {costEstimate.environment_comparison && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Environment Comparison
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(costEstimate.environment_comparison).map(([env, cost]) => (
                <div
                  key={env}
                  className={`p-3 rounded border text-center ${
                    env === environment ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p className="text-xs text-muted-foreground uppercase">{env}</p>
                  <p className="font-mono font-medium">{formatCurrency(cost)}</p>
                </div>
              ))}
            </div>          
          </div>
        )}
      </CardContent>
    </Card>
  );
}
