import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {children}
            </AppContent>
        </AppShell>
    );
}
