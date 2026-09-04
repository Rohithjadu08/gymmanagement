import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MembershipStatus } from '@/types/database.types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: MembershipStatus;
  daysRemaining?: number;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, daysRemaining, className, showIcon = true }: StatusBadgeProps) {
  if (status === 'ACTIVE') {
    return (
      <Badge variant="active" className={className}>
        {showIcon && <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-400" />}
        <span>Active</span>
        {daysRemaining !== undefined && daysRemaining > 0 && (
          <span className="ml-1 opacity-80">({daysRemaining}d left)</span>
        )}
      </Badge>
    );
  }

  if (status === 'DUE_SOON') {
    return (
      <Badge variant="dueSoon" className={className}>
        {showIcon && <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-400" />}
        <span>Due Soon</span>
        {daysRemaining !== undefined && (
          <span className="ml-1 opacity-90">({daysRemaining}d left)</span>
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="overdue" className={className}>
      {showIcon && <XCircle className="mr-1 h-3.5 w-3.5 text-rose-400" />}
      <span>Overdue</span>
      {daysRemaining !== undefined && daysRemaining < 0 && (
        <span className="ml-1 opacity-90">({Math.abs(daysRemaining)}d overdue)</span>
      )}
    </Badge>
  );
}
