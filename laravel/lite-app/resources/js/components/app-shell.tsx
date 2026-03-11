import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export function AppShell({ children}: Props) {
    return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
    );
}
