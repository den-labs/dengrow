export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-white pt-10 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 text-dengrow-500"
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
            <span className="font-display text-lg font-bold tracking-tight">
              DenGrow
            </span>
          </div>
          <div className="text-center text-sm text-muted-foreground md:text-right">
            <p>&copy; {new Date().getFullYear()} DenGrow. Built on Stacks.</p>
            <div className="mt-1 flex justify-center gap-4 md:justify-end">
              <a
                href="https://docs.dengrow.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-dengrow-500"
              >
                Docs
              </a>
              <a
                href="https://twitter.com/dengrow_xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-dengrow-500"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
