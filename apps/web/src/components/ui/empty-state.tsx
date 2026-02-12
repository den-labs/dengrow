import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  variant: 'wallet' | 'loading' | 'error' | 'empty';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center',
        className
      )}
    >
      {variant === 'wallet' && (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-muted shadow-sm">
            <svg
              className="h-8 w-8 text-dengrow-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold">
            {title ?? 'Wallet Not Connected'}
          </h3>
          <p className="mb-4 max-w-xs text-sm text-muted-foreground">
            {description ??
              'Connect your Stacks wallet to view your DenGrow garden and manage your NFTs.'}
          </p>
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-dengrow-500 text-white hover:bg-dengrow-600"
            >
              {action.label}
            </Button>
          )}
        </>
      )}

      {variant === 'loading' && (
        <>
          <div className="relative mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-dengrow-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-dengrow-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-6 w-6 animate-pulse text-dengrow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
              </svg>
            </div>
          </div>
          <h3 className="mb-1 animate-pulse font-medium text-dengrow-500">
            {title ?? 'Fertilizing the soil...'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {description ?? 'Syncing with Bitcoin L2'}
          </p>
        </>
      )}

      {variant === 'error' && (
        <div className="w-full max-w-sm">
          <div className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-semibold text-red-700">
                {title ?? 'Failed to Load Garden'}
              </h4>
              <p className="mb-3 text-xs leading-relaxed text-red-600">
                {description ??
                  "We couldn't retrieve your plant data from the chain. This might be due to network congestion on Stacks."}
              </p>
              {action && (
                <button
                  onClick={action.onClick}
                  className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 hover:underline"
                >
                  <Loader2 className="h-3 w-3" />
                  {action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {variant === 'empty' && (
        <>
          <div className="mb-4 rounded-full border border-dashed bg-muted p-6">
            <svg
              className="h-10 w-10 text-muted-foreground opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-medium">
            {title ?? 'No plants yet'}
          </h3>
          <p className="mb-5 max-w-[200px] text-sm text-muted-foreground">
            {description ??
              'Start your collection by minting your first seed.'}
          </p>
          {action && (
            <Button
              variant="outline"
              onClick={action.onClick}
              className="border-dengrow-500 text-dengrow-500 hover:bg-dengrow-50"
            >
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
