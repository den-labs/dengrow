import * as React from 'react';
import { cn } from '@/lib/utils';

function Stat({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col', className)} {...props} />;
}

function StatLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

function StatNumber({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-2xl font-bold tracking-tight', className)} {...props} />
  );
}

function StatHelpText({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Stat, StatLabel, StatNumber, StatHelpText };
