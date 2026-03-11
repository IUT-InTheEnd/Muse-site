import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'main'> & {
    variant?: 'header' | 'sidebar';
};

export function AppContent({
    variant = 'header',
    children,
    className,
    ...props
}: Props) {
    if (variant === 'sidebar') {
        return (
            <main
                className={cn(
                    'relative flex min-h-svh flex-1 flex-col bg-background',
                    'md:m-2 md:ml-0 md:rounded-xl md:shadow-sm',
                    'max-w-full',
                    className,
                )}
                {...props}
            >
                {children}
            </main>
        );
    }

    return (
        <main
            className={cn(
                'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-6',
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
